export default async function handler(req) {
  // 跨域配置
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
  // 处理跨域预检
  if (req.method === "OPTIONS") return new Response(null, { headers })
  if (req.method !== "POST") return new Response("仅支持POST请求", { status:405, headers })

  try {
    const { messages } = await req.json()
    // 转换对话格式：Gemini 和 DeepSeek 消息结构不一样
    const geminiContents = messages.map(item => ({
      role: item.role === "user" ? "user" : "model",
      parts: [{ text: item.content }]
    }))

    // Gemini 官方接口地址
    const apiKey = process.env.GEMINI_KEY
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7
        }
      })
    })

    const result = await res.json()
    // 把 Gemini 返回格式转成前端原来适配的 OpenAI/DeepSeek 格式，页面不用改代码
    const transformData = {
      choices: [
        {
          message: {
            content: result.candidates[0].content.parts[0].text
          }
        }
      ]
    }
    return new Response(JSON.stringify(transformData), { headers })
  } catch (err) {
    return new Response(JSON.stringify({error: "AI请求失败"}), {status:500, headers})
  }
}
