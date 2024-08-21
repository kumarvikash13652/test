let cartCount = 0;

function toggleCart() {
	alert('Cart functionality coming soon!');
}

function addToCart(productName, productPrice) {
	cartCount++;
	document.querySelector('.cart-button').innerText = `Cart (${cartCount})`;
	alert(`${productName} added to cart!`);
}

function showSlide(index) {
	const slides = document.querySelectorAll('.slide');
	if (index >= slides.length) {
		currentSlide = 0;
	} else if (index < 0) {
		currentSlide = slides.length - 1;
	} else {
		currentSlide = index;
	}
	const offset = -currentSlide * 100;
	document.querySelector('.slides').style.transform = `translateX(${offset}%)`;
}

function nextSlide() {
	showSlide(currentSlide + 1);
}

function prevSlide() {
	showSlide(currentSlide - 1);
}

function toggleDropdown() {
	var dropdownMenu = document.getElementById("dropdown-menu");
	if (dropdownMenu.style.display === "block") {
		dropdownMenu.style.display = "none";
	} else {
		dropdownMenu.style.display = "block";
	}
}

<script src="script.js"></script>
</body>
</html>