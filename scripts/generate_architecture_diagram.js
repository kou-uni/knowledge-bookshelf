
const fs = require('fs');

async function generateArchitectureDeck() {
    const templatePath = "/Users/minanspark/Downloads/uniのテンプレート.pptx";
    const outputPath = "/Users/minanspark/Downloads/Architecture_Explanation.pptx";
    const projectId = "0105b764-619a-47be-ba3e-bc581e02ac69"; // Reusing valid ID
    const endpoint = "http://localhost:3002/api/generate-ppt";

    console.log("Generating Architecture Explanation Deck...");
    console.log("Template:", templatePath);

    if (!fs.existsSync(templatePath)) {
        console.error("Template not found!");
        process.exit(1);
    }

    // 1. Prepare Base64
    const fileBuffer = fs.readFileSync(templatePath);
    const templateBase64 = fileBuffer.toString('base64');

    // 2. Define Architecture Content (Japanese)
    const architectureAgenda = {
        title: "Anthropic Skill アーキテクチャ解説",
        items: [
            {
                id: "1",
                sectionTitle: "基本概念",
                slides: [
                    {
                        title: "3つの役割 (The 3 Roles)",
                        topic: "Architecture Overview",
                        bullets: [
                            "1. Rearrange (構成):",
                            "   - テンプレートから必要なスライドを複製し、プレゼンの骨組みを作成。",
                            "2. Inventory (棚卸):",
                            "   - スライド内の「書き込み可能な場所（ID）」を解析・特定。",
                            "3. Replace (書き込み):",
                            "   - 特定したIDに対して、AIが生成したコンテンツを注入。",
                            "   - 日本語プレースホルダー（タイトル、コンテンツ）にも対応。"
                        ],
                        speakerNotes: "この3段階のプロセスにより、どんなテンプレートでも柔軟に対応可能です。",
                        layout: "Content"
                    }
                ]
            },
            {
                id: "2",
                sectionTitle: "データフロー",
                slides: [
                    {
                        title: "処理フロー (Pipeline)",
                        topic: "Data Flow",
                        bullets: [
                            "User Request (ユーザー要求)",
                            "  ↓",
                            "Strategist (戦略家): アジェンダ（目次）の策定",
                            "  ↓",
                            "Writer (ライター): 各スライドの原稿執筆",
                            "  ↓",
                            "Artisan (職人): pptx-automizerによるバイナリ生成",
                            "  ↓",
                            "Output (成果物): User Download"
                        ],
                        speakerNotes: "各エージェントが専門的な役割を果たすことで、高品質なアウトプットを実現・Vercelのタイムアウトも回避しています。",
                        layout: "Content"
                    }
                ]
            },
            {
                id: "3",
                sectionTitle: "要件定義",
                slides: [
                    {
                        title: "テンプレート要件 (Requirements)",
                        topic: "Template Specs",
                        bullets: [
                            "必須マスタースライド:",
                            "  - タイトル用スライド（Title + Subtitle）",
                            "  - コンテンツ用スライド（Title + Content）",
                            "プレースホルダー命名規則:",
                            "  - 英語: Title, Content, Body, Placeholder",
                            "  - 日本語: タイトル, コンテンツ, プレースホルダー",
                            "  - ※これらが含まれるIDを自動検出して書き込みます。"
                        ],
                        speakerNotes: "この要件さえ満たせば、会社の公式テンプレートでもそのまま利用可能です。",
                        layout: "Content"
                    }
                ]
            }
        ]
    };

    // 3. Call API
    const payload = {
        action: 'render',
        projectId: projectId,
        params: {
            fullAgenda: architectureAgenda,
            templateBase64: templateBase64
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(outputPath, buffer);
        console.log("Success! File saved to:", outputPath);

    } catch (e) {
        console.error("Generation Failed:", e);
        process.exit(1);
    }
}

generateArchitectureDeck();
