let ingredientsDB = {};

// Load JSON database
fetch("ingredients.json")
    .then(response => response.json())
    .then(data => {
        ingredientsDB = data;
    });

// Fake AI function
async function getAIAnalysis(ingredient) {

    let lower = ingredient.toLowerCase();

    // Oils & butters
    if (lower.includes("oil") || lower.includes("butter")) {
        return `${ingredient}: Emollient ingredient. Can moisturize but may clog pores for acne-prone skin.`;
    }

    // Acids
    else if (lower.includes("acid")) {
        return `${ingredient}: Exfoliating or pH-adjusting ingredient. Helps skin renewal but may irritate sensitive skin.`;
    }

    // Alcohols
    else if (lower.includes("alcohol")) {
        return `${ingredient}: Can dry out skin and may cause irritation if used in high concentration.`;
    }

    // Glycols (very common in products)
    else if (lower.includes("glycol")) {
        return `${ingredient}: Humectant that helps retain moisture. Generally safe for most skin types.`;
    }

    // Surfactants / cleansers
    else if (lower.includes("betaine") || lower.includes("surfactant")) {
        return `${ingredient}: Mild cleansing agent. Usually safe but may irritate very sensitive skin.`;
    }

    // Preservatives
    else if (lower.includes("hexanediol") || lower.includes("phenoxyethanol")) {
        return `${ingredient}: Preservative used to prevent bacterial growth. Generally safe in small amounts.`;
    }

    // pH adjusters / stabilizers
    else if (lower.includes("carbomer") || lower.includes("tromethamine")) {
        return `${ingredient}: Used to stabilize formulation and adjust pH. Not harmful for skin.`;
    }

    // Extracts
    else if (lower.includes("extract")) {
        return `${ingredient}: Plant extract. Usually soothing but depends on skin sensitivity.`;
    }

    // Silicones
    else if (lower.includes("dimethicone")) {
        return `${ingredient}: Silicone that smooths skin and locks moisture. Non-comedogenic and safe.`;
    }

    // Default
    else {
        return `${ingredient}: Common skincare ingredient. Generally safe and used for formulation stability or texture.`;
    }
}

// MAIN FUNCTION
async function analyzeIngredients() {

    let input = document.getElementById("ingredients").value;

    // split by comma or new line
    let inputIngredients = input.split(/,|\n/);

    let skinType = document.getElementById("skinType").value;

    let result = "";

    for (let item of inputIngredients) {

        let cleanItem = item.trim().toLowerCase().replace(/\s+/g, " ");

        if (!cleanItem) continue;

        // STEP 2: smart matching
        let data = ingredientsDB[cleanItem];

        if (!data) {
            let keys = Object.keys(ingredientsDB);
            let match = keys.find(key => cleanItem.includes(key));

            if (match) {
                data = ingredientsDB[match];
                cleanItem = match;
            }
        }

        // STEP 3: show result
        if (data) {

            let tag = "";
            let className = "";

            if (data.avoidFor.includes(skinType)) {
                tag = "❌ Not suitable";
                className = "danger";
            } else if (data.goodFor.includes(skinType)) {
                tag = "✅ Good";
                className = "safe";
            } else {
                tag = "⚠️ Neutral";
                className = "caution";
            }

            result += `
            <div class="result-box">
                <b>${cleanItem}</b><br>
                <span class="${className}">${tag}</span><br>
                Comedogenic: ${data.comedogenic}/5 <br>
                Irritation: ${data.irritationRisk} <br>
                ${data.description}
                ${data.rednessTrigger ? '<br><span style="color:red;">⚠️ May cause redness</span>' : ''}
            </div>
            `;

        } else {

            let aiText = await getAIAnalysis(cleanItem);

            result += `
            <div class="result-box">
                <b>${cleanItem} (AI)</b><br>
                ${aiText}
            </div>
            `;
        }
    }

    document.getElementById("result").innerHTML = result;
}
