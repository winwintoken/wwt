// note: USDT, USDC decimal = 6

var walletConnect = false;
var walletAddress;
var balance = 0;
var decimals=18;

var tokenAddress; // wwt token
var wwtlpAddress; //wwt lp token
var wwtPoolAddress; //wwt-lp pool address

var currentPagePoolID = 0;
var currentPageWalletBalance = 0;
var currentPageStaked = 0;
var currentPageReward = 0;

var mm_tron = new $.mm_tron({
	// OK
	contract_address: "",
	precision: 100000000000000000
});


//全部以trx计价
var prices = {
	usdt: 37.2,
	trx: 1.0,
	pearl: 14080.1,
	jfi: 6110.3,
	wwt: 10000.0,
};

const trx_address = "T9ycGdsTDc9hAVobuNauvZAd14dt9LVyee";
const usdt_address = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const pearl_address = "TGbu32VEGpS4kDmjrmn5ZZJgUyHQiaweoq";
const jfi_address = "TN7zQd2oCCguSQykZ437tZzLEaGJ7EGyha";
const wwt_address = "xx";


function setNileNode() {
	console.log("setNileNode");
	tokenAddress = contractAddresses['testWwtTokenAddress']; // wwt token
	wwtlpAddress = contractAddresses['testWwtLPAddress']; //wwt lp token
	wwtPoolAddress = contractAddresses['testWwtPoolAddress']; //wwt-lp pool address
}

function setMainNode() {
	console.log("setMainNode");
	tokenAddress = contractAddresses['wwtTokenAddress']; // wwt token
	wwtlpAddress = contractAddresses['wwtLPAddress']; //wwt lp token
	wwtPoolAddress = contractAddresses['wwtPoolAddress']; //wwt-lp pool address
}

function parseJustswapData(data) {
	// console.log("parseJustswapData : "+data);
	var tmp = eval('(' + data + ')');
	var d = tmp.data;
	var usdt = d["0_" + usdt_address];
	if (usdt) {
		prices['usdt'] = usdt.price;
		// console.log("price:u=" + usdt_price + ",jfi=" + jfi_price + ",pearl=" + pearl_price);
		console.log("usdt=" + prices['usdt'] + ",wwt=" + prices['wwt']);
		updatePrice(prices['wwt'] / prices['usdt']);
	}
	var pearl = d["0_" + pearl_address];
	if (pearl) {
		prices['pearl'] = pearl.price;
		// console.log("price:u=" + usdt_price + ",jfi=" + jfi_price + ",pearl=" + pearl_price);
	}
	var jfi = d["0_" + jfi_address];
	if (jfi) {
		prices['jfi'] = jfi.price;
		// console.log("price:u=" + usdt_price + ",jfi=" + jfi_price + ",pearl=" + pearl_price);
	}
	var wwt = d["0_" + wwt_address];
	if (wwt) {
		prices['wwt'] = wwt.price;
		// console.log("price:u=" + usdt_price + ",jfi=" + jfi_price + ",pearl=" + pearl_price+",wwt="+wwt_price);	
	}
	// console.log("parseJustswapData finish");
}

function loadJustswapData() {
	for (var i = 0; i < 10; i++) {
		$("#div1").load('https://api.justswap.io/v2/allpairs?page_size=200&page_num=' + i, function (response, status, xhr) {
			if (status) {
				parseJustswapData(response);
			}
		});
	}
}

//contract,name,url,weight,yield
var pools = [
	[
		"TT5eiN2GaGikcTUyPZcuHNj31f2edYzgBu",    //用来质押的代币地址，比如这个是wwt-trx lp 地址
		'WWT/TRX',
		'TMN2GpeJhYgwqPoRDbvevqtWKdwBBD3wqX',    //用来挖矿的地址，比如这个是矿池wwt-trx lp的地址
		12,
		0,
		0,
	],
	[
		'TX3wPdSdnJ7wto4QyZ2J9QEVr5XcgEr6Cq',
		'WWT',
		'',
		2,
		0,
		0,
	],
	[
		'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
		'USDT',
		'',
		1,
		0,
		0,
	],
	[
		'TGbu32VEGpS4kDmjrmn5ZZJgUyHQiaweoq',
		'PEARL',
		'',
		1,
		0,
		0,
	],
	[
		'TSNWgunSeGUQqBKK4bM31iLw3bn9SBWWTG',
		'COLA',
		'',
		1,
		0,
		0,
	],
	[
		'TW1sqqq7UphAqGNHDXSLXsEainYHJuQeyC',
		'SSK',
		'',
		1,
		0,
		0,
	],
	[
		'TKkeiboTkxXKJpbmVFbv4a8ov5rAfRDMf9',
		'SUN',
		'',
		1,
		0,
		0,
	],
];
var loadedpools = 0;
var totalPoolWeight = 14; // sum of weight


function updateYield() {
	// need modification
	var perblock = 100;
	var annualblock = (365 * 86400) / 13; // approximation of 13 sec/block
	var annualreward = annualblock * perblock;
	var perpoolunit = annualreward / totalPoolWeight;

	var ctx2 = new web3.eth.Contract(uniswapABI, pools[0][0]);
	ctx2.methods.getReserves().call(function (err, result1) {
		ctx2.methods.totalSupply().call(function (err, result2) {
			ctx2.methods.balanceOf(chefAddress).call(function (err, result3) {
				var totalSupply = result2; // total supply of UNI-V2
				var stakedSupply = result3; // staked amount in chef
				var percentageOfSupplyInPool = stakedSupply / totalSupply;
				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit);
				// total liquidity ~ 2*(single token liquidity)*(staked percentage), reserve0 = eth , reserve1 = usdt
				pools[0][4] =
					((perpoolunit /
						((result1['_reserve1'] * 2) / Math.pow(10, 6))) *
						100 *
						pools[0][3]) /
					percentageOfSupplyInPool;
				pools[0][5] =
					((result1['_reserve1'] * 2) / Math.pow(10, 6)) *
					percentageOfSupplyInPool;
				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit,result1['_reserve1']/Math.pow(10,18),pools[0][3]);
				$('.pool0yield').animateNumbers(parseInt(pools[0][4]) + '%');
				loadedPool();
			});
		});
	});

	//uniswap _revserve0 and 1 is amount*decimal of each token
	var ctx0 = new web3.eth.Contract(uniswapABI, pools[5][0]);
	ctx0.methods.getReserves().call(function (err, result1) {
		ctx0.methods.totalSupply().call(function (err, result2) {
			ctx0.methods.balanceOf(chefAddress).call(function (err, result3) {
				//console.log('BURGER with ETH ctx1:',result1['_reserve0'],result1['_reserve1']);
				var totalSupply = result2; // total supply of UNI-V2
				var stakedSupply = result3; // staked amount in chef
				var percentageOfSupplyInPool = stakedSupply / totalSupply;
				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit);
				// total liquidity ~ 2*(single token liquidity)*(staked percentage), reserve1 = burger, reseve0 = eth
				pools[5][4] =
					((perpoolunit /
						((result1['_reserve1'] * 2) / Math.pow(10, 18))) *
						100 *
						pools[5][3]) /
					percentageOfSupplyInPool;
				pools[5][5] =
					((prices['burgerusd'] * result1['_reserve1'] * 2) /
						Math.pow(10, 18)) *
					percentageOfSupplyInPool;
				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit,result1['_reserve0']/Math.pow(10,18),pools[5][3]);
				$('.pool5yield').animateNumbers(parseInt(pools[5][4]) + '%');
				loadedPool();
			});
		});
	});

}


function updateConnectStatus() {
	if (walletConnect) {
		$('body').addClass('web3');
	}
	getBalance(walletAddress);
}
function getSupply() {
	var contract = new web3.eth.Contract(tokenABI, tokenAddress);
	contract.methods.totalSupply().call(function (error, result) {
		result = result / Math.pow(10, 18);

		//console.log(error, result)
		$('.supply span').animateNumbers(parseInt(result));
		$('.mcap span').animateNumbers(parseInt(result * prices['burgerusd']));
	});
}
function getBalance(address) {
	async function triggercontract() {
		console.log("tokenAddress="+tokenAddress);
		console.log("wallet address="+address);
		let instance = await window.tronWeb.contract().at(tokenAddress);
		let res = await instance.totalSupply().call();
		console.log("total =" + res);
		let balanceOf = await instance.balanceOf(address).call();
		decimals = await instance.decimals().call();

		balance = balanceOf / Math.pow(10, decimals);
		$('.balance').text(balance.toFixedSpecial(2) + ' WWT');
	}
	triggercontract();
}

function hidepages() {
	$('main').hide();
}

function nav(classname) {
	hidepages();
	$('body').removeClass('approved');
	$('main.' + classname).show();
	if (classname.indexOf('pool') === 0) {
		initpooldata(parseInt(classname.slice(-1)));
		$('main.pool').show();
	}
}

function initpooldata(id) {
	async function triggercontract() {
		$('.farmname').text(pools[id][1] + ' pool');
		currentPagePoolID = id;
		//get yield balance

		//get staked balance
		//if larger than zero, approved
		var allowance = 0;
		if (id == 0) {
			//这是lp token，需要单独处理
			//checkAllowance(userAddress, contractAddress)
			allowance = await mm_tron.allowance(walletAddress, pools[id][0], pools[id][2]);
			let lpDecimals = await mm_tron.decimals(pools[id][0]);
			console.log("lpDecimals="+lpDecimals);
			let lpBalance = await mm_tron.balanceOf(walletAddress,pools[id][0],lpDecimals);
			$('#maxAvaliable').text(lpBalance);
		}else{
			let tokenContract = await window.tronWeb.contract.at(pools[id][0]);
			allowance = await tokenContract.allowance(walletAddress,pools[id][2]);
		}
		console.log("allowance=" + allowance);
		if (allowance > 0) {
			$('body').addClass('approved');
		}

		let poolContract = await window.tronWeb.contract().at(pools[id][2]);
		let totalStake = await poolContract.totalSupply().call();
		console.log("totalStake="+totalStake);
		$('.totalstake').text((totalStake/Math.pow(10,decimals)).toFixedSpecial(4));

		let balance = await poolContract.balanceOf(walletAddress).call();
		console.log("balance="+balance);
		balance = (balance / Math.pow(10, decimals)).toFixedSpecial(4);
		console.log("balance="+balance);
		$('.stakedbalance').text(balance);

		$('#stakeToken').text(pools[id][1]+" ");

		let earned = await poolContract.earned(walletAddress).call();
		earned = (earned / Math.pow(10, decimals)).toFixedSpecial(4);
		$('.rewardbalance').text(earned);
	}
	triggercontract();

}
function approveSpend() {
	async function trigger(){
		await mm_tron.approve(pools[currentPagePoolID][0],pools[currentPagePoolID][2]);
	}
	trigger();
}

function stake() {
	showAlert();
	// async function trigger(){
	// 	let poolContract = await window.tronWeb.contract().at(pools[currentPagePoolID][2]);
	// 	let totalStake = await poolContract.stake().call();
	// }
	// trigger();

	// var contract = new web3.eth.Contract(chefABI, chefAddress);
	// var amount = prompt(
	// 	'Amount to stake',
	// 	(currentPageWalletBalance - 1000000) / Math.pow(10, 18)
	// ); // to fix round error due to JS

	// contract.methods
	// 	.deposit(
	// 		currentPagePoolID,
	// 		(amount * Math.pow(10, 18) - 100).toFixedSpecial(0)
	// 	)
	// 	.send({ from: walletAddress }, function (err, transactionHash) {
	// 		//console.log(transactionHash)
	// 	});

}

function maxStake(){
	var max = $('#maxAvaliable').text();
	console.log("maxStake="+max);
	document.getElementById('stakeInput').value = max
	// var input = $("#stakeInput");
	// input.attr("value","123")
	// input.val("123");
	// $('#stakeInput').setAttribute("value",max);
}

function showAlert(){
	document.getElementById('light').style.display='block';
	document.getElementById('fade').style.display='block';
}

function claimReward() {
	var contract = new web3.eth.Contract(chefABI, chefAddress);
	contract.methods
		.deposit(currentPagePoolID, 0)
		.send({ from: walletAddress }, function (err, transactionHash) {
			//some code
			//console.log(transactionHash)
		});
}
function removeFromPool() {
	var contract = new web3.eth.Contract(chefABI, chefAddress);
	var amount = prompt(
		'Amount to withdraw',
		(currentPageStaked - 1000000) / 10 ** 18
	); // to fix round error due to JS
	contract.methods
		.withdraw(
			currentPagePoolID,
			(amount * Math.pow(10, 18)).toFixedSpecial(0)
		)
		.send({ from: walletAddress }, function (err, transactionHash) {
			//some code
			//console.log(transactionHash)
		});
}

function loadedPool() {
	loadedpools++;

	if (loadedpools > 4) {
		var tvl = 0;
		for (var i = 0; i < pools.length; i++) {
			tvl = tvl + pools[i][5];
		}

		var realtvl = 0;
		for (var i = 0; i < pools.length; i++) {
			if (i != 2 && i != 3) {
				realtvl = realtvl + pools[i][5];
			}
		}

		$('.tvl span').animateNumbers(parseInt(tvl));
		console.warn('tvl:' + tvl);
	}
}

function updatePrice(p) {
	$('.tokenprice').text('$' + p.toFixedSpecial(4));
	updateYield();
}
function getlptoken(id) {
	if (typeof id === 'undefined') {
		window.open(pools[currentPagePoolID][2]);
	} else {
		window.open(pools[id][2]);
	}
}

var timer = setInterval(() => {
	console.log("address start")
	gettronweb();
}, 1000);

function gettronweb() {
	if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
		console.log("address Yes:" + window.tronWeb.defaultAddress.base58)
		walletAddress = window.tronWeb.defaultAddress.base58;
		clearInterval(timer);
		walletConnect = true;
		checkNode();
		updateConnectStatus();
		loadJustswapData();
	} else {
		console.log("address No")
		wallet_address.textContent = "未连接钱包（需要安装TronLink钱包）";
	}
}



function checkNode() {
	var host = window.tronWeb.fullNode.host;
	console.log("checkNode="+host);
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
	initpooldata(currentPagePoolID);
}, 30000);


function uploadReword() {
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
			wwtPoolAddress,
			functionSelector,
			options,
			parameter
		);
		var signedTx = await tronWeb.trx.sign(tx.transaction);
		await tronWeb.trx.sendRawTransaction(signedTx);
	}
	triggercontract();
}