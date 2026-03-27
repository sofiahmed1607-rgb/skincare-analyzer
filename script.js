let ingredientsDB = {};

fetch("ingredients.json")
    .then(response => response.json())
    .then(data => {
        ingredientsDB = data;
    });

async function getAIAnalysis(ingredient) {
    let lower = ingredient.toLowerCase();

    if (lower.includes("oil")) {
        return "May clog pores, not ideal for acne-prone skin.";
    } 
    else if (lower.includes("acid")) {
        return "Exfoliating ingredient, may irritate sensitive skin.";
    } 
    else {
        return "No data available. Check before use.";
    }
}

async function analyzeIngredients() {

    let input = document.getElementById("ingredients").value;
    let items = input.split(",");

    let result = "";

    for (let item of items) {
        let cleanItem = item.trim().toLowerCase();

        if (ingredientsDB[cleanItem]) {
            let data = ingredientsDB[cleanItem];

            result += `
            <div class="result-box">
                <b>${cleanItem}</b><br>
                Comedogenic: ${data.comedogenic}/5 <br>
                Irritation: ${data.irritationRisk} <br>
                ${data.description}
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
