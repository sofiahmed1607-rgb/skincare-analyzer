let ingredientsDB = {};
let productsDB = {};

// Load ingredient database
fetch("ingredients.json")
    .then(response => response.json())
    .then(data => {
        ingredientsDB = data;
    });

// Load products database
fetch("products.json")
    .then(res => res.json())
    .then(data => {
        productsDB = data;
    });


// Fake AI fallback
async function getAIAnalysis(ingredient) {

    let lower = ingredient.toLowerCase();

    if (lower.includes("oil") || lower.includes("butter")) {
        return `${ingredient}: Emollient ingredient. Can moisturize but may clog pores for acne-prone skin.`;
    }
    else if (lower.includes("acid")) {
        return `${ingredient}: Exfoliating ingredient. Helps skin renewal but may irritate sensitive skin.`;
    }
    else if (lower.includes("alcohol")) {
        return `${ingredient}: Can dry out skin and may cause irritation if used in high concentration.`;
    }
    else if (lower.includes("glycol")) {
        return `${ingredient}: Humectant that helps retain moisture. Generally safe.`;
    }
    else if (lower.includes("extract")) {
        return `${ingredient}: Plant extract. Usually soothing but depends on skin sensitivity.`;
    }
    else {
        return `${ingredient}: Common skincare ingredient. Generally safe.`;
    }
}


// MAIN ANALYZER
async function analyzeIngredients() {

    let input = document.getElementById("ingredients").value;
    let inputIngredients = input.split(/,|\n/);
    let skinType = document.getElementById("skinType").value;

    let result = "";
    let totalScore = 0;
    let goodCount = 0;
    let badCount = 0;

    for (let item of inputIngredients) {

        let cleanItem = item.trim().toLowerCase().replace(/\s+/g, " ");
        if (!cleanItem) continue;

        let data = ingredientsDB[cleanItem];

        // smart matching
        if (!data) {
            let keys = Object.keys(ingredientsDB);
            let match = keys.find(key => cleanItem.includes(key));

            if (match) {
                data = ingredientsDB[match];
                cleanItem = match;
            }
        }

        if (data) {

            // ⭐ KEY INGREDIENT BOOST
            if (cleanItem.includes("niacinamide") && skinType === "oily") {
                totalScore += 5;
            }

            if (cleanItem.includes("salicylic acid") && skinType === "oily") {
                totalScore += 3;
            }

            if (cleanItem.includes("hyaluronic") && skinType === "dry") {
                totalScore += 5;
            }

            // penalties
            if (data.comedogenic >= 4) totalScore -= 1;
            if (data.irritationRisk === "high") totalScore -= 1;

            let tag = "";
            let className = "";

            if (data.avoidFor.includes(skinType)) {
                tag = "❌ Not suitable";
                className = "danger";
                totalScore -= 1;
                badCount++;
            }
            else if (data.goodFor.includes(skinType)) {
                tag = "✅ Good";
                className = "safe";
                totalScore += 3;
                goodCount++;
            }
            else {
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

    // ⭐ BALANCE FIX
    if (goodCount > badCount) {
        totalScore += 3;
    }

    // FINAL VERDICT
    let verdict = "";
    let summary = "";
    let verdictClass = "";

   if (totalScore >= 4) {
    verdict = "✅ Good Product";
    summary = "Suitable for your skin type. Most ingredients are beneficial.";
    verdictClass = "verdict-good";
}
else if (totalScore >= 1) {
    verdict = "⚠️ Okay Product";
    summary = "Some ingredients are good, but there are minor concerns.";
    verdictClass = "verdict-okay";
}
else {
    verdict = "❌ Not Suitable";
    summary = "This product may not suit your skin due to multiple risk factors.";
    verdictClass = "verdict-bad";
}

   document.getElementById("result").innerHTML = `
    <div class="result-box ${verdictClass}">
        <h2>${verdict}</h2>
        <p>${summary}</p>
        <p><b>Score:</b> ${totalScore}</p>
    </div>
    ${result}
`;
}


// PRODUCT ANALYZER
function analyzeProduct() {

    let productName = document.getElementById("product").value.toLowerCase();

    let productKey = Object.keys(productsDB).find(key => {
        let keyWords = key.split(" ");
        let inputWords = productName.split(" ");

        let matchCount = inputWords.filter(word => keyWords.includes(word)).length;
        return matchCount >= 2;
    });

    if (!productKey) {
        document.getElementById("result").innerHTML = `
        <div class="result-box danger">
            ❌ Product not found
        </div>`;
        return;
    }

    let ingredients = productsDB[productKey].ingredients;

    document.getElementById("ingredients").value = ingredients.join(", ");
    analyzeIngredients();
}
