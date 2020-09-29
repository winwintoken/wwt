// note: USDT, USDC decimal = 6

var walletConnect = false;
var walletAddress;
var wwtDecimals = 18;

var tokenAddress; // wwt token

//计算WWT-TRX LP Token价格，单位usdt
var wwtlpPrice = 0.06;

var currentPagePoolID = "WWT/TRX";

function setNileNode() {
	console.log("setNileNode");
	tokenAddress = contractAddresses['testWwtTokenAddress']; // wwt token
}

function setMainNode() {
	console.log("setMainNode");
	tokenAddress = contractAddresses['wwtTokenAddress']; // wwt token
}

function parseJustswapData(data) {
	// console.log("parseJustswapData : "+data);
	var tmp = eval('(' + data + ')');
	var d = tmp.data;

	for (var i = 0; i < allTokens.length; i++) {
		var name = allTokens[i];
		var token = pools[name];
		// console.log("name="+name+",address="+token.address);
		var info = d["0_" + token.address];
		if (info) {
			token.price = info.price;
			token.decimals = info.base_decimal;
			// console.log("name=" + name + ",price=" + info.price);
		}
	}
}

function loadJustswapData() {
	for (var i = 0; i < 10; i++) {
		$("#div1").load('https://api.justswap.io/v2/allpairs?page_size=300&page_num=' + i, function (response, status, xhr) {
			if (status) {
				parseJustswapData(response);
				var usdt = pools["USDT"];
				if (usdt.price != 0) {
					calRealPrice();
				}
			}
		});
	}
}

//计算所有token对USDT的价格
function calRealPrice() {
	var usdt = pools["USDT"];
	for (var i = 0; i < allTokens.length; i++) {
		var name = allTokens[i];
		if (name != "USDT") {
			var token = pools[name];
			if(!token.priceNormalize)
			token.price = token.price / usdt.price;
			if(token.price!=0)
			token.priceNormalize = true;
			if (name == "WWT") {
				$('.tokenprice').text('$' + parseFloat(token.price).toFixed(4));
			}
			if (name == "WWT/TRX") {
				token.price = wwtlpPrice;
			}
			// console.log("name="+name+",price="+token.price);
		}
	}
}

//name,address,poolAddress,weight,poolTotalStake,userStake,userBalance
function createToken(name, address, poolAddress) {
	var oTempToken = new Object;

	//用来质押的代币名称
	oTempToken.name = name;

	//用来质押的代币地址，比如这个是wwt-trx lp 地址
	oTempToken.address = address;

	//用来挖矿的地址，比如这个是矿池wwt-trx lp的地址
	oTempToken.poolAddress = poolAddress;

	//该矿池能挖出来总代币数量，这个是WWT的数量
	oTempToken.totalReward = 50;

	//该矿池目前质押的总数量
	oTempToken.poolTotalStake = 0;

	//该矿池这个用户质押了多少
	oTempToken.userStake = 0;

	//该矿池用来挖矿的代币，用户有多少，单位是wei，即需要除以10^decimals，才是用户看的
	oTempToken.userBalance = 0;

	//用户当前挖出来多少代币
	oTempToken.userEarn = 0;

	//该矿池的挖矿币的价格
	oTempToken.price = 0;

	oTempToken.priceNormalize = false;

	//该矿池的挖矿币的精度
	oTempToken.decimals = 18;

	//该矿池的APY
	oTempToken.apy = 0;
	return oTempToken;
}
// "JFI",
// "HT",
// "GOLD",
// "DZI",
// "MKR",
var allTokens = [
	"WWT/TRX",
	"WWT",
	"USDT",
	"PEARL",
	"COLA",
	"SSK",
	"SUN",
]

var pools = {
	"WWT/TRX": createToken("WWT/TRX", "TLYRrVeGXKkZyZXweo7yDZqWDPq1DpdFVu", "TMr5kifkZVfGqWgcuofvYYgECTFhxGL6Bo"),
	"WWT": createToken("WWT", "TUHVUsg8hvR4TxmWAbfvKTKwGdrqArmYsv", "TLfG1ogM21DVYKL8UqTmLksjkHccMa6BhS"),
	"USDT": createToken("USDT", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "TGEA1ML342FLHw2t3g9Fr631Cnbnw61rm8"),
	"PEARL": createToken("PEARL", "TGbu32VEGpS4kDmjrmn5ZZJgUyHQiaweoq", "TWmK7fBMpyKn9nHwtZrKzkXgT3LnhexETD"),
	"COLA": createToken("COLA", "TSNWgunSeGUQqBKK4bM31iLw3bn9SBWWTG", "TJUXaE6Be69QsRL8doAHN2YWWXFjH2qG6s"),
	"SSK": createToken("SSK", "TW1sqqq7UphAqGNHDXSLXsEainYHJuQeyC", "TX1AxuHk8LL4Rxyb7pR3i2kpBg64tR3cWA"),
	"SUN": createToken("SUN", "TKkeiboTkxXKJpbmVFbv4a8ov5rAfRDMf9", "TBXJaSvyYxRMfBY2fXWsqim3XoH61qHouP"),
}

function updateAllTokens() {
	var usdt = pools["USDT"];
	if (usdt.price == 0) {
		return;
	}
	for (var i = 0; i < allTokens.length; i++) {
		var name = allTokens[i];
		updateAPY(name);
	}
}

function updateAPY(name) {
	async function trigger() {
		// console.log("updateapy " + name + ",address=" + pools[name].poolAddress);

		if (name === "WWT/TRX" && pools[name].address.length>0) {
			let lpDecimals = await mm_tron.decimals(pools[name].address);
			pools[name].decimals = lpDecimals;
		}

		let poolContract = await window.tronWeb.contract().at(pools[name].poolAddress);
		let totalStake = await poolContract.totalSupply().call();

		totalStake = window.tronWeb.toDecimal(totalStake);
		// console.log("updateAPY name=" + name + ", totalStake=" + totalStake);

		//池子每s产出wwt数量
		let rewardRate = await poolContract.rewardRate().call();
		rewardRate = window.tronWeb.toDecimal(rewardRate) / Math.pow(10, wwtDecimals);

		let wwwToken = pools["WWT"];
		if(wwwToken.price==0){
			wwwToken.price = 1000;
		}
		//每s能挖出的wwt总价格
		let rewardPrice = rewardRate * wwwToken.price;

		//用来质押的代币
		let stakeToken = pools[name];

		let totalStakePrice = totalStake / Math.pow(10, stakeToken.decimals) * stakeToken.price;

		// console.log("updateapy token price=" + stakeToken.price);

		//每s，每u能产出的产率
		let aps = 1;
		if (totalStakePrice != 0)
			aps = rewardPrice / totalStakePrice;

		let apy = aps * 60 * 60 * 24 * 365;

		// console.log("totalStakePrice="+totalStakePrice+",apy="+apy);

		stakeToken.apy = apy;

		var apyStr = parseInt(apy) * 100 + ' %';
		if (totalStakePrice == 0){
			apyStr = "Infinity %";
		}

		var apyp = ".poolyield" + name;
		if (name === "WWT/TRX") {
			apyp = ".poolyieldWWTTRX";
		}
		// console.log("apy str="+apyStr);
		$(apyp).animateNumbers(apyStr);
	}
	if (pools[name] && pools[name].poolAddress) {
		trigger();
	}
}

function updateConnectStatus() {
	if (walletConnect) {
		$('body').addClass('web3');
	}
	getBalance(walletAddress);
}

function getBalance(address) {
	async function triggercontract() {
		console.log("wallet address=" + address);
		//TUHVUsg8hvR4TxmWAbfvKTKwGdrqArmYsv
		let instance = await window.tronWeb.contract().at(tokenAddress);
		let res = await instance.totalSupply().call();
		console.log("total =" + res);
		let balanceOf = await instance.balanceOf(address).call();
		wwtDecimals = await instance.decimals().call();
		pools["WWT"].decimals = wwtDecimals;
		pools["WWT"].userBalance = balanceOf;
		$('.balance').text((balanceOf / Math.pow(10, wwtDecimals)).toFixedSpecial(2) + ' WWT');
	}
	triggercontract();
}

function hidepages() {
	$('main').hide();
}

function nav(classname) {
	hidepages();
	$('body').removeClass('approved');

	if (classname.indexOf('pool') === 0) {
		$('#singlepool').show();
		currentPagePoolID = classname.slice(4);
		initpooldata(currentPagePoolID);
		$('main.pool').show();
	} else {
		$('main.' + classname).show();
		updateAllTokens();
	}
}
var mm_tron = new $.mm_tron({
	contract_address: "",
	precision: 100000000000000000
});

function initpooldata(name) {
	console.log("initpooldata:"+name);
	async function triggercontract() {
		var c = await window.tronWeb.contract().at(tokenAddress);
		$('.farmname').text(pools[name].name + ' pool');
		currentPagePoolID = name;

		if (name === "WWT/TRX") {
			if(pools[name].address.length==0){
				return;
			}
			//这是lp token，需要单独处理
			//checkAllowance(userAddress, contractAddress)
			var allowance = await mm_tron.allowance(walletAddress, pools[name].address, pools[name].poolAddress);
			// console.log("allowance=" + allowance);
			if (allowance > 0) {
				$('body').addClass('approved');
			}
			let lpDecimals = await mm_tron.decimals(pools[name].address);
			// console.log("lpDecimals=" + lpDecimals);
			let lpBalance = await mm_tron.balanceOf(walletAddress, pools[name].address);
			pools[name].userBalance = lpBalance;
			pools[name].decimals = lpDecimals;
		} else {
			var token = pools[name];
			let tokenContract = await window.tronWeb.contract().at(token.address);
			var allowance = await tokenContract.allowance(walletAddress, pools[name].poolAddress).call();
			// console.log("allowance=" + allowance);
			if(name=="USDT"){
				allowance=allowance.remaining;
			}
			var rallowance = window.tronWeb.toDecimal(allowance);
			if (rallowance > 0) {
				$('body').addClass('approved');
			}
			let b = await tokenContract.balanceOf(walletAddress).call();
			pools[name].userBalance = b;
		}

		var stakeDecimals = pools[name].decimals;
		let poolContract = await window.tronWeb.contract().at(pools[name].poolAddress);
		let totalStake = await poolContract.totalSupply().call();
		// console.log("totalStake=" + totalStake);
		$('.totalstake').text((totalStake / Math.pow(10, stakeDecimals)).toFixedSpecial(4) +" "+ pools[currentPagePoolID].name);
		pools[name].poolTotalStake = totalStake;

		let userStake = await poolContract.balanceOf(walletAddress).call();
		// console.log("userStake=" + userStake);
		pools[name].userStake = userStake;
		$('.stakedbalance').text((userStake / Math.pow(10, stakeDecimals)).toFixedSpecial(4)+" "+ pools[currentPagePoolID].name);

		$('#stakeToken').text(pools[name].name + " ");

		let earned = await poolContract.earned(walletAddress).call();
		pools[name].userEarn = earned;
		earned = (earned / Math.pow(10, wwtDecimals)).toFixedSpecial(4);
		$('.rewardbalance').text(earned);
	}
	triggercontract();
}

function approve() {
	async function trigger() {
		if(pools[currentPagePoolID].name=="WWT/TRX")
		{
			await mm_tron.approve(pools[currentPagePoolID].address, pools[currentPagePoolID].poolAddress);
		}
		else{
			var contract = await window.tronWeb.contract().at(pools[currentPagePoolID].address);
			await contract.approve(pools[currentPagePoolID].poolAddress,window.tronWeb.toHex(1e77)).send
			({
				feeLimit: 100000000,
				callValue: 0,
				shouldPollResponse: true,
			});
		}
		// toastAlert("授权已经发起，刷新页面。");
	}
	trigger();
}

function stake() {
	if(pools[currentPagePoolID].userBalance==0){
		toastAlert("Token is not enough!");
		return;
	}
	document.getElementById("popTitle").innerHTML = "Stake";
	var userBalance = (pools[currentPagePoolID].userBalance / Math.pow(10, pools[currentPagePoolID].decimals)).toFixed(4);
	$('#maxAvaliable').text(userBalance);
	document.getElementById('stakeInput').value = 0;
	$("#withdrawdiv").hide();
	$("#stakediv").show();
	showAlert();
}

function withdraw() {
	if(pools[currentPagePoolID].userStake==0){
		toastAlert("No token can be withdrawn")
		return
	}
	document.getElementById("popTitle").innerHTML = "Withdraw";
	var max = (pools[currentPagePoolID].userStake / Math.pow(10, pools[currentPagePoolID].decimals)).toFixed(4);
	$('#maxAvaliable').text(max);
	document.getElementById('stakeInput').value = 0;
	$("#withdrawdiv").show();
	$("#stakediv").hide();
	//maxAvaliable
	showAlert();
}

function withdrawSure() {
	hideAlert();
	var token = pools[currentPagePoolID];
	if (token && token.poolAddress) {
		async function trigger() {
			var contract = await window.tronWeb.contract().at(token.poolAddress);
			var stake = parseFloat(document.getElementById('stakeInput').value);

			contract.Withdrawn().watch((err, eventResult) => {
				if (err) {
					return console.error('Error with Withdraw:', err);
				}
				if (eventResult) {
					// console.log('eventResult:', eventResult);
					toastAlert("Withdraw success!");		
					initpooldata(currentPagePoolID);
				}
			});

			await contract.withdraw(window.tronWeb.toHex(stake * Math.pow(10, token.decimals)))
				.send(
					{
						feeLimit: 100_000_000,
						callValue: 0,
						shouldPollResponse: true
					}
				);
			// toastAlert("交易请求已经发出，请等待结果返回...");			
		}
		trigger();
	}

}

function stakeSure() {
	hideAlert();
	var token = pools[currentPagePoolID];
	if (token && token.poolAddress) {
		async function trigger() {
			var contract = await window.tronWeb.contract().at(token.poolAddress);
			var stake = parseFloat(document.getElementById('stakeInput').value);

			contract.Staked().watch((err, eventResult) => {
				if (err) {
					return console.error('Error with stake:', err);
				}
				if (eventResult) {
					// console.log('eventResult:', eventResult);
					toastAlert("Stake success!");	
					initpooldata(currentPagePoolID);
				}
			});
		
			await contract.stake(window.tronWeb.toHex(stake * Math.pow(10, token.decimals)))
				.send(
					{
						feeLimit: 100_000_000,
						callValue: 0,
						shouldPollResponse: true
					}
				).then(function(){
					console.log("stake result");
				});
			// toastAlert("交易请求已经发出，请等待结果返回...");	
		}
		trigger();
	}

}

function maxStake() {
	var max = $('#maxAvaliable').text();
	// console.log("maxStake=" + max);
	document.getElementById('stakeInput').value = max
}

function showAlert() {
	document.getElementById('light').style.display = 'block';
	document.getElementById('fade').style.display = 'block';
}

function hideAlert() {
	document.getElementById('light').style.display = 'none';
	document.getElementById('fade').style.display = 'none';
}

function claimReward() {
	var token = pools[currentPagePoolID];
	if(token.userEarn==0){
		toastAlert("No token can be claimed!")
		return;
	}
	if (token && token.poolAddress) {
		async function trigger() {
			var contract = await window.tronWeb.contract().at(token.poolAddress);
			contract.RewardPaid().watch((err, eventResult) => {
				if (err) {
					return console.error('Error with stake:', err);
				}
				if (eventResult) {
					// console.log('eventResult:', eventResult);
					alert("Stake success!");
					initpooldata(currentPagePoolID);
				}
			});

			contract.getReward()
				.send(
					{
						feeLimit: 100_000_000,
						callValue: 0,
						shouldPollResponse: true
					}
				);
		}
		trigger();
	}
}

var timer = setInterval(() => {
	// console.log("address start")
	gettronweb();
}, 300);

function gettronweb() {
	if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
		// console.log("address Yes:" + window.tronWeb.defaultAddress.base58)
		walletAddress = window.tronWeb.defaultAddress.base58;
		clearInterval(timer);
		walletConnect = true;
		checkNode();
		updateConnectStatus();
		loadJustswapData();
	} else {
		console.log("address No")
	}
}

function checkNode() {
	var host = window.tronWeb.fullNode.host;
	console.log("checkNode=" + host);
	if (host == "https://api.nileex.io") {
		setNileNode();
	} else if (host == "https://api.trongrid.io") {
		setMainNode();
	}
}

function test() {

}

Number.prototype.toFixedSpecial = function (n) {
	var str = this.toFixed(n);
	if (str.indexOf('e+') === -1) return str;

	str = str
		.replace('.', '')
		.split('e+')
		.reduce(function (p, b) {
			return p + Array(b - p.length + 2).join(0);
		});

	if (n > 0) str += '.' + Array(n + 1).join(0);

	return str;
};


setInterval(function () {
	//每隔10s自动更新信息
	updateAllTokens();
}, 20000);

setInterval(function () {
	//每隔10s自动更新信息
	initpooldata(currentPagePoolID);
}, 5000);


//官方上传代币到挖矿池子里
function uploadReword() {
	let poolAddress = pools["WWT/TRX"].poolAddress;
	//notifyRewardAmount
	async function triggercontract() {
		// var functionSelector = "allowance(address,address)";
		var functionSelector = "notifyRewardAmount(uint256)";

		var parameter = [{
			type: "uint256",
			value: window.tronWeb.toHex(600e18)
		}
		];
		var options = {};
		let tx = await tronWeb.transactionBuilder.triggerSmartContract(
			poolAddress,
			functionSelector,
			options,
			parameter
		);
		var signedTx = await tronWeb.trx.sign(tx.transaction);
		await tronWeb.trx.sendRawTransaction(signedTx);
	}
	triggercontract();
}

function toastAlert(msg){
	console.log("toastAlert:"+msg);
	document.getElementById('alertdiv').style.display='block';
	document.getElementById('alertdiv').innerHTML = msg;
	setTimeout(function(){
		document.getElementById('alertdiv').style.display='none';
	},2000);
}