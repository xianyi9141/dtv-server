$(function(){
	// Input auto format
	// $('#confirmdata').html("BTC :3HYMFE9MyFKsXyDWK4AVWAGDo6fGErano7 <br>ETH: 0xf1a8298715dbdab0eebf329ca4f24da6379be8aa <br>LTC: LKyf4zhtfnMu7aZDuCsSqZ3cXBahnx9sa2<br>The minimum amount of deposit is 0.001 BTC/ETH/LTC.If you will send less than 0.001 BTC/ETH/LTC, you will lose that money.");
	var clipboard = new Clipboard('.copybtn');
	$('button').tooltip({
	  trigger: 'click',
	  placement: 'bottom'
	});

	// $(".totalamount").text(1323 + " (" + 'BTC' + ")");
 //    $(".pkinput").val('3HYMFE9MyFKsXyDWK4AVWAGDo6fGErano7');
	// $(".willget").text("You will get " + 700.02 + " Setcoin");
	// $('.btn-confirm').click();

	function setTooltip(btn,message) {
	  btn.tooltip('hide')
	    .attr('data-original-title', message)
	    .tooltip('show');
	}

	function hideTooltip(btn) {
	  setTimeout(function() {
	    btn.tooltip('hide');
	  }, 1000);
	}

	clipboard.on('success', function(e) {
	  var btn = $(e.trigger);
	  setTooltip(btn,'Copied!');
	  hideTooltip(btn);
	});
	clipboard.on('error', function(e) {
	  var btn = $(e.trigger);
	  setTooltip('Failed!');
	  hideTooltip(btn);
	});
	$('.currency').toArray().forEach(function(field){
        new Cleave(field, {
            numeral: true,
			numeralThousandsGroupStyle: 'thousand'
        });
    });
    $('.card').toArray().forEach(function(field){
        new Cleave(field, {
	    creditCard: true,
	    onCreditCardTypeChanged: function (type) {
	        // update UI ...
	    }});
    });
    $('.cvc').toArray().forEach(function(field){
        new Cleave(field, {
		    blocks: [3]
		});
    });
    $('.currencytype').change(function() {
    	$(".currencies").css('display', 'none');
    });
    $('.buy').on('click', function(e) {
    	// if (e.isDefaultPrevented()) {
	    //     alert('form is not valid');
	    // } else {
    	e.preventDefault();
		var amount = parseFloat($('.currencytype option:selected').text());		
		var limit = 0.001;
		if(amount <= limit) {
				$(".limitnotify").css('display', 'block');
				$(".success").css('display','none');
				$(".limitnotify").text("The minimum amount of deposit is 0.001 BTC/ETH/LTC.If you will send less than 0.001 BTC/ETH/LTC, you will lose that money.");
				$(".notify").text("");
		        	$('.btn-confirm').click();
				return;
		}
			var currencytype = $('.currencytype option:selected').val();
			if (currencytype == 'BTC') {
				$(".currencies").css('display', 'none');
				$(".btc").css('display', 'block');
			} else if (currencytype == 'ETH') {
				$(".currencies").css('display', 'none');
				$(".eth").css('display', 'block');
			} else if (currencytype == 'LTC') {
				$(".currencies").css('display', 'none');
				$(".ltc").css('display', 'block');
			} else if (currencytype == 'USD') {
				$(".currencies").css('display', 'none');
				$(".usd").css('display', 'block');
			} else if (currencytype == 'EUR') {
				$(".currencies").css('display', 'none');
				$(".eur").css('display', 'block');
			}
	});
	$('.currencies').validator().on('submit', function(e) {
		// body...
		if (e.isDefaultPrevented()) {
	        alert('form is not valid');
	    } else {
			e.preventDefault();
			var currencytype = $('.currencytype option:selected').val();
			var email, eth_addr="", ltc_addr="", btc_addr="", message="";
			var cur_type = currencytype;
			if (currencytype == 'BTC') {
				email = $(".btc input[type=email]").val();
				// eth_addr = $(".btc .eth_addr").val();
				btc_addr = $(".btc .wallet_addr").val();
				message = "3HYMFE9MyFKsXyDWK4AVWAGDo6fGErano7";
			} else if (currencytype == 'ETH') {
				email = $(".eth input[type=email]").val();
				eth_addr = $(".eth .eth_addr").val();
				message = "0xf1a8298715dbdab0eebf329ca4f24da6379be8aa";
			} else if (currencytype == 'LTC') {
				email = $(".ltc input[type=email]").val();
				// eth_addr = $(".ltc .eth_addr").val();
				ltc_addr = $(".ltc .wallet_addr").val();
				message = "LKyf4zhtfnMu7aZDuCsSqZ3cXBahnx9sa2";
			} else if (currencytype == 'USD') {
				cur_type = 'fiat';
				email = $(".usd input[type=email]").val();
				eth_addr = $(".usd .eth_addr").val();
			} else if (currencytype == 'EUR') {
				cur_type = 'fiat';
				email = $(".eur input[type=email]").val();
				eth_addr = $(".eur .eth_addr").val();
			}
			// console.log(cur_type, email, btc_addr, eth_addr, ltc_addr);
			var amount = parseFloat($('.currencytype option:selected').text());
			var limit = 0.001;
			if(amount > limit) {
				$.post("/buytoken",
			    {
			        cur_type: cur_type, email: email, btc_addr: btc_addr, eth_addr: eth_addr, ltc_addr: ltc_addr
			    },
			    function(data, status){
			    	console.log(data);
			    	if(data = 'error') {
			    		alert('There is problem with internet connection');
			    		return;
			    	}
			        $(".totalamount").text(amount + " (" + cur_type + ")");
			        $("#pkinput").attr("readonly", false);
			        $("#pkinput").val(message);
			        $("#pkinput").attr("readonly", true);
					$(".limitnotify").css('display', 'none');
					$(".success").css('display','block');
						$(".willget").text("You will get " + $(".setcoin").val() + " Setcoin");
						$(".notify").html("*After your payment, please send email to <b>investor@setcoins.io</b> with the screenshot of your transaction. For <b>$100 000+ orders</b> we have additional bonuses");
				        $('.btn-confirm').click();
			    	});
			}
		}
	});
	$('.setcoin').on('keyup', function() {
		var amount = parseInt($(this).val().replace(/,/g, ''),10);
		var currencies = [];
		$('.currencies').css('display', 'none');
		if (!isNaN(amount)) { 
			var BTC = parseFloat(amount/100000);
			var ETH = parseFloat(amount/10000);
			var LTC = parseFloat(amount/1500);
			var EUR = parseFloat(amount/12);
			var USD = parseFloat(amount/10);
			currencies.push(BTC+"BTC", ETH+"ETH", LTC+"LTC", USD+"USD", EUR+"EUR");
		} else {
			currencies.push("0.000000BTC", "0.000000ETH", "0.000000LTC", "0USD", "0EUR");			
		}
		for (var i = 0,j = 0; i < $('.currencytype option').length; i++) {
			if ($($('.currencytype option')[i]).val()) {
				$($('.currencytype option')[i]).text(currencies[j]);
				j++;
			}
		}
	});
});
