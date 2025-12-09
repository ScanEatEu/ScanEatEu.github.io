document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('order-list');
    const totalPriceSpan = document.getElementById('total-price');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const checkoutButton = document.getElementById('checkout-button');
    
    // Objeto para almacenar el pedido (key: nombre del producto, value: {price, quantity})
    let cart = {};

    // Función para actualizar la visualización del carrito y el total
    function updateCartDisplay() {
        productList.innerHTML = '';
        let total = 0;

        // Si el carrito está vacío
        if (Object.keys(cart).length === 0) {
            productList.innerHTML = '<li>No hay productos en el pedido.</li>';
            totalPriceSpan.textContent = '$0';
            return;
        }

        // Recorrer el carrito y actualizar el HTML y el total
        for (const key in cart) {
            const item = cart[key];
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${item.name} (x${item.quantity}) 
                <span class="item-price">$${itemTotal.toLocaleString('es-CL')}</span>
                <button class="remove-one" data-key="${key}">-</button>
                <button class="add-one" data-key="${key}">+</button>
            `;
            productList.appendChild(listItem);
        }

        // Actualizar el total con formato de miles (asumiendo moneda CLP/sin decimales)
        totalPriceSpan.textContent = `$${total.toLocaleString('es-CL')}`;

        // Añadir listeners a los nuevos botones
        document.querySelectorAll('.remove-one').forEach(button => {
            button.addEventListener('click', handleRemoveOne);
        });
        document.querySelectorAll('.add-one').forEach(button => {
            button.addEventListener('click', handleAddOne);
        });
    }

    // Manejador para añadir un producto al carrito
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const name = e.target.dataset.name;
            const price = parseInt(e.target.dataset.price); // Precio en enteros
            const key = e.target.dataset.key;

            if (cart[key]) {
                cart[key].quantity += 1;
            } else {
                cart[key] = { name, price, quantity: 1 };
            }

            updateCartDisplay();
        });
    });

    // Manejador para restar una unidad
    function handleRemoveOne(e) {
        const key = e.target.dataset.key;
        if (cart[key]) {
            cart[key].quantity -= 1;
            if (cart[key].quantity <= 0) {
                delete cart[key]; // Eliminar del carrito si la cantidad es 0
            }
        }
        updateCartDisplay();
    }

    // Manejador para sumar una unidad
    function handleAddOne(e) {
        const key = e.target.dataset.key;
        if (cart[key]) {
            cart[key].quantity += 1;
        }
        updateCartDisplay();
    }


    // Manejador del botón de Pagar
    checkoutButton.addEventListener('click', () => {
        if (Object.keys(cart).length === 0) {
            alert('¡El pedido está vacío! Añade productos para continuar.');
            return;
        }

        const method = document.getElementById('payment-method').value;
        const totalText = totalPriceSpan.textContent;

        let ticketMessage = '\n--- TICKET DE COMPRA ---\n';
        for (const key in cart) {
            const item = cart[key];
            const itemTotal = item.price * item.quantity;
            ticketMessage += `${item.quantity} x ${item.name} = $${itemTotal.toLocaleString('es-CL')}\n`;
        }
        ticketMessage += `\nTOTAL A PAGAR: ${totalText}\n`;
        ticketMessage += `Método de Pago: ${method.charAt(0).toUpperCase() + method.slice(1)}\n`;
        ticketMessage += `\n¡Gracias por tu compra en Don Eugenio!`;

        console.log(ticketMessage);
        alert(ticketMessage); // Mostrar el ticket en un pop-up simple
        
        // Opcional: Reiniciar el carrito después del checkout
        // cart = {};
        // updateCartDisplay();
    });

    // Inicializar la visualización del carrito
    updateCartDisplay();

    // Mostrar/ocultar QR dinámico al elegir método 'transferencia'
    const qrImg = document.getElementById('qr-img');
    const paymentMethodSelect = document.getElementById('payment-method');
    function updateQR() {
        if (!qrImg || !paymentMethodSelect) return;
        if (paymentMethodSelect.value === 'transferencia') {
            const totalNumeric = parseInt(totalPriceSpan.textContent.replace(/\D/g, '')) || 0;
            const payUrl = `https://don-eugenio.example/pay?amount=${totalNumeric}`;
            const apiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(payUrl);
            qrImg.src = apiUrl;
            qrImg.style.display = 'block';
        } else {
            qrImg.style.display = 'none';
        }
    }
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', updateQR);
        updateQR();
    }
});