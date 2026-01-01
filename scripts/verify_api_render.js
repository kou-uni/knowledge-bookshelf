
const fs = require('fs');

async function testApi() {
    const templatePath = "/Users/minanspark/Downloads/uniのテンプレート.pptx";
    const outputPath = "/Users/minanspark/Downloads/verification_output_v2.pptx";
    const projectId = "0105b764-619a-47be-ba3e-bc581e02ac69";
    const endpoint = "http://localhost:3002/api/generate-ppt";

    console.log("Starting E2E API Test...");
    console.log("Target Project:", projectId);
    console.log("Template:", templatePath);

    if (!fs.existsSync(templatePath)) {
        console.error("Template not found!");
        process.exit(1);
    }

    // 1. Prepare Base64 Template
    const fileBuffer = fs.readFileSync(templatePath);
    const templateBase64 = fileBuffer.toString('base64');
    console.log("Template loaded and encoded (Length: " + templateBase64.length + ")");

    // 2. Prepare Mock Agenda (Japanese)
    const mockAgenda = {
        title: "検証用プレゼンテーション",
        items: [
            {
                id: "1",
                sectionTitle: "機能テスト",
                slides: [
                    {
                        title: "システム検証",
                        topic: "パイプラインテスト",
                        bullets: [
                            "アップロードロジック正常",
                            "Base64転送正常",
                            "ステートレスレンダリング確認済"
                        ],
                        speakerNotes: "このスライドはフルスタックの動作確認用です。",
                        layout: "Content"
                    }
                ]
            }
        ]
    };

    // 3. Call API
    console.log("Sending Request to " + endpoint + "...");
    const payload = {
        action: 'render',
        projectId: projectId,
        params: {
            fullAgenda: mockAgenda,
            templateBase64: templateBase64,
            // access_token? Not needed in dev
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error ${response.status}: ${errText}`);
        }

        console.log("Response OK. Downloading buffer...");
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log("Writing output to:", outputPath);
        fs.writeFileSync(outputPath, buffer);

        const stats = fs.statSync(outputPath);
        console.log("Success! Generated File Size:", stats.size, "bytes");

        if (stats.size > 0) {
            console.log("VERIFICATION PASSED");
        } else {
            console.error("VERIFICATION FAILED: Empty file");
            process.exit(1);
        }

    } catch (e) {
        console.error("Test Failed:", e.message);
        process.exit(1);
    }
}

testApi();
