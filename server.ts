import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API route for generating the analytical report
  app.post("/api/gemini/report", async (req, res) => {
    try {
      const { products = [], categories = [], orders = [] } = req.body;
      
      const lightProducts = Array.isArray(products) 
        ? products.slice(0, 100).map((p: any) => ({ name: p.name, price: p.price, inStock: p.inStock, category: p.categoryName || p.category }))
        : [];
      const lightCategories = Array.isArray(categories) 
        ? categories.map((c: any) => ({ name: c.name }))
        : [];
      const lightOrders = Array.isArray(orders) 
        ? orders.slice(0, 100).map((o: any) => ({ total: o.total, status: o.status }))
        : [];

      const prompt = `أنت مساعد ذكاء اصطناعي خبير في تحليل البيانات والمبيعات. 
      لدينا متجر أو منصة تجارية وهذه بياناتها الحالية:
      - عدد المنتجات: ${products.length} (عينة: ${JSON.stringify(lightProducts.slice(0, 15))})
      - عدد التصنيفات: ${categories.length} (عينة: ${JSON.stringify(lightCategories.slice(0, 15))})
      - عدد الطلبات: ${orders.length} (عينة: ${JSON.stringify(lightOrders.slice(0, 15))})
      
      يرجى كتابة تقرير تحليلي ملخص باللغة العربية يشمل:
      1. نظرة عامة على الأداء والمخزون.
      2. التحديات المتوقعة بناءً على نقص المخزون أو وفرة الطلبات.
      3. توصيات ومقترحات لتحسين الأداء وزيادة المبيعات.
      
      اجعل التقرير احترافياً ومقسماً وواضحاً وبدون أي مقدمات غير ضرورية. استخدم الماركداون للتنسيق.`;

      const candidateModels = ["gemini-3.6-flash", "gemini-2.5-pro", "gemini-3.0-flash", "gemini-3.5-flash"];
      let response = null;
      let lastError: any = null;

      for (const model of candidateModels) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            response = await ai.models.generateContent({
              model,
              contents: prompt,
            });
            if (response && response.text) break;
          } catch (err: any) {
            lastError = err;
            console.warn(`Attempt ${attempt} for model ${model} failed:`, err?.message || err);
            // If it's a 503 high demand error, wait briefly before retrying or switching model
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 1000 * attempt));
            }
          }
        }
        if (response && response.text) break;
      }

      if (!response || !response.text) {
        const isUnavailable = lastError?.status === "UNAVAILABLE" || lastError?.message?.includes("503") || lastError?.message?.includes("high demand");
        const errMsg = isUnavailable 
          ? "الخدمة تواجه ضغطاً كبيراً حالياً من المزود. يرجى المحاولة بعد لحظات."
          : (lastError?.message || "تعذر توليد التقرير حالياً");
        return res.status(503).json({ error: errMsg });
      }

      res.json({ report: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "حدث خطأ غير متوقع أثناء توليد التقرير" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
