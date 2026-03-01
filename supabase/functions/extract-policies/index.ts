import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DASHSCOPE_BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const MODEL = "qwen-plus";

const DAILY_CALL_LIMIT = 10; // per user per day
const MAX_TEXT_LENGTH = 30_000; // characters

const SYSTEM_PROMPT = `你是一名专业的保险单证解析助手。从用户提供的保险文档文本中提取所有保险保单信息，以 JSON 数组格式返回，不要输出任何其他文字。

每个保单对象结构如下：
{
  "name": "保单名称（字符串，必填）",
  "subCategory": "险种代码（见下方，必填）",
  "annualPremium": 年缴保费（数字，元，无法识别时填 0）,
  "cashValue": 当前现金价值（数字，元，无法识别时填 0）,
  "coverageAmount": 保障额度（数字，元，无法识别时填 0）,
  "startDate": "生效日期（YYYY-MM 格式，无法识别时填空字符串）",
  "endDate": "到期日期（YYYY-MM 格式，选填，无法识别时省略此字段）",
  "isTaxAdvantaged": false,
  "benefits": { "保障项目名": "保障内容/额度", ... },
  "notes": "等待期、免责条款、犹豫期等重要条款（选填）",
  "cashValueSchedule": [{ "year": 1, "amount": 数字 }, ...],
  "premiumSchedule": [{ "year": 1, "amount": 数字 }, ...],
  "coverageSchedule": [{ "year": 1, "amount": 数字 }, ...]
}

险种代码（subCategory）只能从以下 13 个值中选择：
- 保障型：criticalIllness（重疾险）、medical（医疗险）、accident（意外险）、termLife（定期寿险）、cancer（防癌险）
- 储蓄型：increasingWholeLife（增额终身寿险）、pensionAnnuity（养老年金）、educationAnnuity（教育金）、endowment（两全险）、wholeLife（终身寿险）
- 投资型：participating（分红险）、universalLife（万能险）、unitLinked（投连险）

规则：
1. 一份文档可能包含多份保单，全部提取。
2. 保费、现金价值、保额如有万元单位，转换为元（乘以 10000）。
3. 日期格式统一为 YYYY-MM（如"2021年3月"→"2021-03"）。
4. 如无法确定险种代码，优先选择语义最接近的代码。
5. benefits 字段提取保障责任明细，如 "住院垫付": "100万", "重疾赔付": "50万"。
6. notes 字段放等待期、免责条款、犹豫期等重要信息。
7. 如文档包含年度现金价值表、保费缴纳计划或保额变化表，提取到对应 schedule 数组。year 从 1 开始递增。
8. 只输出 JSON 数组，不要解释，不要 markdown 代码块。`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Verify auth ────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "未授权：缺少认证信息" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // User client — validates the JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "未授权：无效的认证信息" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── 2. Validate request body ──────────────────────────────────────────────
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "请提供保险文档文本" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `文档文本过长（最多 ${MAX_TEXT_LENGTH.toLocaleString()} 字符，当前 ${text.length.toLocaleString()} 字符）` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── 3. Rate limiting (10 calls / user / day) ──────────────────────────────
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Read current count
    const { data: limitRow } = await adminClient
      .from("llm_rate_limits")
      .select("call_count")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    const currentCount = limitRow?.call_count ?? 0;
    if (currentCount >= DAILY_CALL_LIMIT) {
      return new Response(
        JSON.stringify({ error: `今日 AI 解析次数已达上限（${DAILY_CALL_LIMIT} 次/天），请明天再试` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Increment count (upsert)
    await adminClient
      .from("llm_rate_limits")
      .upsert(
        { user_id: user.id, date: today, call_count: currentCount + 1 },
        { onConflict: "user_id,date" },
      );

    // ── 4. Get DashScope API key ──────────────────────────────────────────────
    const apiKey = Deno.env.get("DASHSCOPE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "服务端未配置 DashScope API Key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── 5. Call DashScope API ─────────────────────────────────────────────────
    const response = await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `DashScope API 错误 (${response.status}): ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "[]";

    // Strip accidental markdown fences
    const cleaned = content
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    // Validate JSON
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      return new Response(
        JSON.stringify({ error: "AI 返回格式错误，期望 JSON 数组" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ policies: parsed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return new Response(
      JSON.stringify({ error: `解析失败: ${message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
