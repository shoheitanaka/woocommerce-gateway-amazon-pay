/*global jQuery, window, document, setTimeout, console, amazon_payments_advanced, amazon */
( function( $ ) {
	$( function() {
		var button_id = '#pay_with_amazon';
		function renderButton() {
			attemptRefreshData();
			if ( 0 === $( button_id ).length ) {
				return;
			}
			var separator_id = '.wc-apa-button-separator';
			var button_settings = {
				// set checkout environment
				merchantId: amazon_payments_advanced.merchant_id,
				ledgerCurrency: 'EUR',
				sandbox: amazon_payments_advanced.sandbox === '1' ? true : false,
				// customize the buyer experience
				productType: amazon_payments_advanced.action,
				placement: amazon_payments_advanced.placement,
				buttonColor: amazon_payments_advanced.button_color,
				// configure Create Checkout Session request
				createCheckoutSessionConfig: amazon_payments_advanced.create_checkout_session_config
			};
			amazon.Pay.renderButton( button_id, button_settings );
			$( button_id ).siblings( separator_id ).show();
		}
		renderButton();
		$( document.body ).on( 'updated_wc_div', renderButton );

		function attemptRefreshData() {
			var dataCont = $( '#wc-apa-update-vals' );
			if ( ! dataCont.length ) {
				return;
			}
			var data = dataCont.data( 'value' );
			$.extend( amazon_payments_advanced, data );
			dataCont.remove();
		}

		function activateChange( button_id, action ) {
			if ( 0 === $( button_id ).length ) {
				return;
			}
			$( button_id ).on( 'click', function( e ) {
				e.preventDefault();
			} );
			amazon.Pay.bindChangeAction( button_id, {
				amazonCheckoutSessionId: amazon_payments_advanced.checkout_session_id,
				changeAction: action
			} );
		}

		function isAmazonCheckout() {
			return ( 'amazon_payments_advanced' === $( 'input[name=payment_method]:checked' ).val() );
		}

		function toggleDetailsVisibility( detailsListName ) {
			if ( $( '.' + detailsListName + '__field-wrapper' ).children( ':not(.hidden)' ).length === 0 ) {
				$( '.' + detailsListName ).addClass( 'hidden' );
			} else {
				$( '.' + detailsListName ).removeClass( 'hidden' );
			}
		}

		function initAmazonPaymentFields() {
			toggleDetailsVisibility( 'woocommerce-billing-fields' );
			toggleDetailsVisibility( 'woocommerce-shipping-fields' );
			toggleDetailsVisibility( 'woocommerce-additional-fields' );
			activateChange( '#payment_method_widget_change', 'changePayment' );
			activateChange( '#shipping_address_widget_change', 'changeAddress' );
		}

		function toggleFieldVisibility( type, key ) {
			var fieldWrapper = $( '#' + type + '_' + key + '_field' ),
				fieldValue = $( '#' + type + '_' + key ).val();
			fieldWrapper.addClass( 'hidden' );
			$( '.woocommerce-' + type + '-fields' ).addClass( 'hidden' );
			if ( fieldValue == null || fieldValue === '' ) {
				fieldWrapper.removeClass( 'hidden' );
				$( '.woocommerce-' + type + '-fields' ).removeClass( 'hidden' );
			}
		}

		$( 'body' ).on( 'updated_checkout', function() {
			toggleFieldVisibility( 'shipping', 'state' );
			initAmazonPaymentFields();
			if ( ! isAmazonCheckout() ) {
				return;
			}
			if ( $( '.woocommerce-billing-fields .woocommerce-billing-fields__field-wrapper > *' ).length > 0 ) {
				$( '.woocommerce-billing-fields' ).insertBefore( '#payment' );
			}
			if ( $( '.woocommerce-shipping-fields .woocommerce-shipping-fields__field-wrapper > *' ).length > 0 ) {
				var title = $( '#ship-to-different-address' );
				title.find( ':checkbox#ship-to-different-address-checkbox' ).hide();
				title.find( 'span' ).text( amazon_payments_advanced.shipping_title );
				$( '.woocommerce-shipping-fields' ).insertBefore( '#payment' );
			}
			$( '.woocommerce-additional-fields' ).insertBefore( '#payment' );
		} );
	} );
} )( jQuery );
