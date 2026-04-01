let ingredientsDB = {};
let productsDB = {};

// Load ingredient database
fetch("ingredients.json")
    .then(res => res.json())
    .then(data => ingredientsDB = data);

// Load product database
fetch("products.json")
    .then(res => res.json())
    .then(data => productsDB = data);


// AI fallback
async function getAIAnalysis(ingredient) {
    let lower = ingredient.toLowerCase();

    if (lower.includes("oil")) return `${ingredient}: May clog pores for acne-prone skin.`;
    if (lower.includes("acid")) return `${ingredient}: Helps exfoliation but may irritate.`;
    if (lower.includes("alcohol")) return `${ingredient}: Can dry skin.`;

    return `${ingredient}: Generally safe ingredient.`;
}


// 💡 Recommendations
function getRecommendations(skinType) {
    if (skinType === "oily") {
        return ["Niacinamide serum", "Salicylic acid cleanser", "Oil-free gel moisturizer"];
    }
    if (skinType === "dry") {
        return ["Hyaluronic acid serum", "Ceramide cream", "Gentle cleanser"];
    }
    if (skinType === "sensitive") {
        return ["Centella serum", "Aloe gel", "Fragrance-free products"];
    }
}


// MAIN FUNCTION
async function analyzeIngredients() {

    let input = document.getElementById("ingredients").value;
    let skinType = document.getElementById("skinType").value;

    let inputIngredients = input.split(/,|\n/);

    let result = "";
    let totalScore = 0;
    let goodCount = 0;
    let badCount = 0;

    for (let item of inputIngredients) {

        let cleanItem = item.trim().toLowerCase();
        if (!cleanItem) continue;

        let data = ingredientsDB[cleanItem];

        // smart matching
        if (!data) {
            let match = Object.keys(ingredientsDB).find(key => cleanItem.includes(key));
            if (match) {
                data = ingredientsDB[match];
                cleanItem = match;
            }
        }

        if (data) {

            // ⭐ boosts
            if (cleanItem.includes("niacinamide") && skinType === "oily") totalScore += 5;
            if (cleanItem.includes("salicylic") && skinType === "oily") totalScore += 3;
            if (cleanItem.includes("hyaluronic") && skinType === "dry") totalScore += 5;

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
            } else if (data.goodFor.includes(skinType)) {
                tag = "✅ Good";
                className = "safe";
                totalScore += 3;
                goodCount++;
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
            </div>`;
        }

        else {
            let aiText = await getAIAnalysis(cleanItem);

            result += `
            <div class="result-box">
                <b>${cleanItem} (AI)</b><br>
                ${aiText}
            </div>`;
        }
    }

    // balance
    if (goodCount > badCount) totalScore += 2;

    // verdict
    let verdict = "";
    let summary = "";
    let verdictClass = "";

    if (totalScore >= 4) {
        verdict = "✅ Good Product";
        summary = "Suitable for your skin type.";
        verdictClass = "verdict-good";
    } else if (totalScore >= 1) {
        verdict = "⚠️ Okay Product";
        summary = "Some concerns present.";
        verdictClass = "verdict-okay";
    } else {
        verdict = "❌ Not Suitable";
        summary = "Not ideal for your skin.";
        verdictClass = "verdict-bad";
    }

    // recommendations
    let recs = getRecommendations(skinType);

    document.getElementById("result").innerHTML = `
    <div class="result-box ${verdictClass}">
        <h2>${verdict}</h2>
        <p><b>Score:</b> ${totalScore}</p>
        <p>${summary}</p>
    </div>

    <div class="result-box">
        <h3>💡 Better for your skin</h3>
        <ul>
            ${recs.map(r => `<li>${r}</li>`).join("")}
        </ul>
    </div>

    <h3>🔍 Ingredient Breakdown</h3>
    ${result}
    `;
}


// PRODUCT ANALYZER
function analyzeProduct() {

    let productName = document.getElementById("product").value.toLowerCase();

    let productKey = Object.keys(productsDB).find(key => {
        let matchCount = productName.split(" ").filter(w => key.includes(w)).length;
        return matchCount >= 2;
    });

    if (!productKey) {
        document.getElementById("result").innerHTML = `
        <div class="result-box danger">❌ Product not found</div>`;
        return;
    }

    let ingredients = productsDB[productKey].ingredients;

    document.getElementById("ingredients").value = ingredients.join(", ");
    analyzeIngredients();
}

function showSuggestions() {
    let input = document.getElementById("product").value.toLowerCase();
    let suggestionsBox = document.getElementById("suggestions");

    if (!input) {
        suggestionsBox.innerHTML = "";
        return;
    }

    let matches = Object.keys(productsDB)
        .filter(product => product.includes(input))
        .slice(0, 5);

    let html = "";

    matches.forEach(product => {
        html += `<div class="suggestion-item" onclick="selectProduct('${product}')">
                    ${product}
                 </div>`;
    });

    suggestionsBox.innerHTML = html;
}

function selectProduct(name) {
    document.getElementById("product").value = name;
    document.getElementById("suggestions").innerHTML = "";

    analyzeProduct(); // 🔥 auto analyze
}
