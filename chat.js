module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  try {
    const {
      messages = [],
      temperature = 0.6,
      model
    } = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const apiKey = process.env.AI_API_KEY;
    const defaultModel = process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return res.status(500).json({
        error: {
          message: "服务端未配置 AI_API_KEY。请先在 Vercel 环境变量里设置 AI_BASE_URL、AI_API_KEY、AI_MODEL。"
        }
      });
    }

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || defaultModel,
        temperature,
        messages
      })
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: {
          message: data?.error?.message || data?.message || "上游 AI 接口请求失败。"
        }
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: {
        message: error?.message || "服务端 AI 代理异常。"
      }
    });
  }
};
