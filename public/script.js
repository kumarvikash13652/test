const results = document.getElementById("results");
const preview = document.getElementById("imagePreview");

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const file = document.getElementById("imageInput").files[0];
  if (!file) {
    alert("Please select or capture an image.");
    return;
  }

  preview.innerHTML = `
    <p><strong>Selected Image:</strong></p>
    <img src="${URL.createObjectURL(file)}" alt="Preview" />
  `;

  const formData = new FormData();
  formData.append("image", file);

  results.innerHTML = "<p>🔍 Comparing prices, please wait...</p>";

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    showResults(data);
  } catch (err) {
    console.error(err);
    results.innerHTML = `<p class="error">❌ Something went wrong.</p>`;
  }
});

document.getElementById("searchBtn").addEventListener("click", async () => {
  const productName = document.getElementById("productText").value.trim();
  if (!productName) {
    alert("Please enter a product name to search.");
    return;
  }

  preview.innerHTML = "";
  results.innerHTML = "<p>🔍 Searching Flipkart, please wait...</p>";

  try {
    const response = await fetch(`/search?product=${encodeURIComponent(productName)}`);
    const data = await response.json();
    showResults(data);
  } catch (err) {
    console.error(err);
    results.innerHTML = `<p class="error">❌ Failed to fetch results.</p>`;
  }
});

function showResults(data) {
  results.innerHTML = "";
  if (data.error) {
    results.innerHTML = `<p class="error">❌ ${data.error}</p>`;
    return;
  }

  data.matches.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p class="price">${product.price}</p>
      <img src="${product.logo}" class="logo" alt="${product.website}" />
      <a href="${product.link}" target="_blank" class="buy-btn">Buy on ${product.website}</a>
    `;
    results.appendChild(card);
  });
}
