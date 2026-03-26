let ingredientsDB = {};

fetch("ingredients.json")
    .then(response => response.json())
    .then(data => {
        ingredientsDB = data;
        console.log("DATA LOADED:", data);
    })
    .catch(error => {
        console.log("ERROR:", error);
    });

function analyzeIngredients() {

    if (Object.keys(ingredientsDB).length === 0) {
        alert("Data still loading");
        return;
    }

    let input = document.getElementById("ingredients").value.toLowerCase();
    let skinType = document.getElementById("skinType").value;
    let result = "";

    let inputIngredients = input.split(",");

    inputIngredients.forEach(item => {

        let cleanItem = item.trim();

        if (ingredientsDB[cleanItem]) {

            let data = ingredientsDB[cleanItem];

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
            </div>
            `;

        } else {
            result += `
            <div class="result-box">
                <b>${cleanItem}</b><br>
                ⚠️ No data available
            </div>
            `;
        }
    });

    if (result === "") {
        result = "No matching ingredients found";
    }

    document.getElementById("result").innerHTML = result;
}