function mm_tron(config) {
	this.config = Object.assign({
		name: "",
		contract_address: "",
		chainId: 3,
		precision: 100000000000000000
	}, config);

	/**
	 *当前地址
	 */
	this.address = "";

	/**
	 * 方法集合
	 */
	this.methods = {};
}


/**
 * 获取合约方法集合
 */
mm_tron.prototype.get_methods = async function() {
	if (!window.tronWeb) {
		console.error('not tronWeb')
		return;
	}
	var obj = await tronWeb.trx.getContract(this.config.contract_address);
	let instance = await tronWeb.contract().at(this.config.contract_address);
	var arr = obj.abi.entrys;
	for (var i = 0; i < arr.length; i++) {
		var o = arr[i];
		if (o.stateMutability == "view") {
			this.methods[o.name] = function(...param) {
				return instance[o.name](...param).call()
			};
		} else {
			this.methods[o.name] = function(...param) {
				return instance[o.name](...param).send()
			};
		}
	}
	return obj;
};

/**
 * 字符串转16进制
 * @param {String} str
 * @return {String} 返回16进制值
 */
mm_tron.prototype.toHex = function(str) {
	if (str === "")
		return "";
	var hexCharCode = [];
	hexCharCode.push("0x");
	for (var i = 0; i < str.length; i++) {
		hexCharCode.push((str.charCodeAt(i)).toString(16));
	}
	return hexCharCode.join("");
};

/**
 * 16进制转字符串
 * @param {String} hex 16进制值
 * @return {String} 返回字符串
 */
mm_tron.prototype.toStr = function(hex) {
	var trimedStr = hex.trim();
	var rawStr =
		trimedStr.substr(0, 2).toLowerCase() === "0x" ?
		trimedStr.substr(2) :
		trimedStr;
	var len = rawStr.length;
	if (len % 2 !== 0) {
		alert("Illegal Format ASCII Code!");
		return "";
	}
	var curCharCode;
	var resultStr = [];
	for (var i = 0; i < len; i = i + 2) {
		curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
		resultStr.push(String.fromCharCode(curCharCode));
	}
	return resultStr.join("");
};

/**
 * 补零
 * @param {String} value 需要补零的字符串
 * @return {String} 补零后的字符串
 */
mm_tron.prototype.full_zore = function(value) {
	var len = 64 - value.length;
	var val = "";
	for (var i = 0; i < len; i++) {
		val += "0"
	}
	return val + value;
};

/**
 * 转16进制
 * @param {String} num 数值
 * @param {Number} map 精度
 * @return {String} 转换结果
 */
mm_tron.prototype.toChage_16 = function(num, map) {
	return '0x' + (num * (map || this.config.precision)).toString(16);
};

/**
 * 转10进制
 * @param {String} num 数值
 * @param {Number} map 精度
 * @return {String} 转换结果
 */
mm_tron.prototype.toChage_10 = function(value, map) {
	return parseInt(value.replace('0x', ''), 16) / (map || this.config.precision)
};

/**
 * 转为参数
 * @param {String} name 请求方法名称
 * @param {Array} param 请求参数集合
 * @return {Object} 返回参数
 */
mm_tron.prototype.to_param = function(name, ...param) {
	var code = this.methods[name];
	var data = code;
	for (var i = 0; i < param.length; i++) {
		var o = param[i];
		if (typeof(o) == 'string') {
			data += this.full_zore(o.replace('0x', ''));
		} else if (typeof(o) == 'number') {
			data += this.full_zore(this.toChage_16(o, 1).replace('0x', ''));
		}
	}

	return {
		to: this.config.contract_address, // 必需，合同发布期间除外 Required except during contract publications.
		from: this.address, // 发送地址 must match user's active address.
		data: data, // '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // 可选，但用于定义智能合约的创建和交互 Optional, but used for defining smart contract creation and interaction.
		chainId: this.config.chainId, // 用于防止跨区块链的事务重用，由MetaMask自动填充 Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
	};
};

/**
 * 推送 —— 发送到链上
 * @param {String} name 方法名
 * @param {String} value 数值
 * @param {Array} param 参数
 */
mm_tron.prototype.send = async function(name, value, ...param) {
	if (!name) {
		return
	}
	console.log(this.config.contract_address + ` send ${name} req`, param);
	if (!window.tronWeb) {
		return;
	}
	try {
		let instance = await tronWeb.contract().at(this.config.contract_address);
		if (instance[name]) {
			let res = await instance[name](...param).send({
				feeLimit: 100000000,
				callValue: value || 0,
				shouldPollResponse: true
			});
			// console.log(`send ${name} res`, res);
			return res;
		} else {
			console.error(this.config.contract_address + ": " + name + " is undefined");
		}
	} catch (e) {
		console.log(this.config.contract_address + "的方法 " + name + " 错误", e)
	}

};

/**
 * 呼叫 —— 接收到本地
 * @param {String} name 方法名
 * @param {String} value 数值
 * @param {Array} param 参数
 */
mm_tron.prototype.call = async function(name, value, ...param) {
	if (!name) {
		return
	}
	console.log(this.config.contract_address + ` call ${name} req`, param);
	if (!window.tronWeb) {
		return;
	}
	try {
		let instance = await tronWeb.contract().at(this.config.contract_address);
		if (instance[name]) {
			let res = await instance[name](...param).call({
				feeLimit: 100000000,
				callValue: value || 0,
				shouldPollResponse: true
			});
			// console.log(`call ${name} res`, res);
			return res;
		} else {
			console.error(this.config.contract_address + ": " + name + " is undefined");
		}
	} catch (e) {
		console.log(this.config.contract_address + "的方法 " + name + " 错误", e)
	}
};

/**
 * 转到合约地址
 * @param {String} form_address 发送地址
 * @param {String} to_address 接收地址
 * @param {Number} amount 转账金额
 * @param {String} value 数值
 * @return {object} 返回执行结果
 */
mm_tron.prototype.trade = async function(form_address, to_address, amount, value = '0x00') {
	// console.log('trade req', pm);
	if (!window.tronWeb) {
		return;
	}
	try {
		var tx = await tronWeb.transactionBuilder.sendTrx(to_address || this.config.contract_address, 10,
			form_address);
		var signedTx = await tronWeb.trx.sign(tx);
		var broastTx = await tronWeb.trx.sendRawTransaction(signedTx);
		return broastTx;
	} catch (e) {
		console.log(this.config.contract_address + "的 trade 错误", e)
	}
};

/**
 * 转到合约地址
 * @param {String} name 方法名
 * @param {Array} param 参数
 * @return {}
 */
mm_tron.prototype.balance = async function(address) {
	var o = await tronWeb.trx.getBalance(address);
	return o / this.config.precision;
};

/**
 * 警示
 * @param {String} message 消息内容
 * @param {String} type
 */
mm_tron.prototype.alert = async function(message, type = "error") {
	console.log(message, type);
};

/**
 * 请求
 * @param {String} method 方法
 * @param {Array} params 参数
 * @param {Funciton} func 回调函数
 * @return {Object} 执行结果
 */
mm_tron.prototype.req = async function(method = 'eth_accounts', params, func) {
	if (func) {
		ethereum
			.request({
				method,
				params
			})
			.then((res) => {
				func(res)
			})
			.catch((error) => {
				if (error.code === 4001) {
					// EIP-1193 userRejectedRequest error
					this.alert('Please connect to MetaMask.');
				} else {
					this.alert(error);
				}
			});
	} else {
		return await ethereum
			.request({
				method,
				params
			});
	}
};

/**
 * 获取账户
 */
mm_tron.prototype.get_accounts = async function() {
	return await this.req("eth_requestAccounts", {});
};

/**
 * 获取地址
 */
mm_tron.prototype.login = async function() {
	var res = await this.req("eth_requestAccounts", {});
	if (res && res.length) {
		var address = res[0];
		this.address = address;
		return address;
	}
};

/**
 * 是否已登录
 * @return {object} 执行结果
 * @return {Boolean} 登录成功返回true, 失败返回false
 */
mm_tron.prototype.isLink = function() {};

/**
 * 获取地址
 */
mm_tron.prototype.get_address = function() {
	var address = ethereum.selectedAddress;
	if (address) {
		this.address = address;
		return address;
	}
	return null;
}


/**
 * 查询授权
 * @param {String} userAddress 用户地址
 * @param {String} contractAddress 代币合约地址
 * @return {String} 是否有授权
 */
mm_tron.prototype.allowance = async function(userAddress, tokenAddress,spenderAddress) {
	var functionSelector = "allowance(address,address)";
	var parameter = [{
		type: "address",
		value: userAddress
	}, {
		type: 'address',
		// 池子地址
		value: spenderAddress
	}];
	var options = {};

	var res = await tronWeb.transactionBuilder.triggerConstantContract(
		tokenAddress,
		functionSelector,
		options,
		parameter,
	);
	if (res && res.constant_result.length > 0) {
		return this.toChage_10(res.constant_result[0])
	}
	return 0
};

async function checkAllowance(userAddress, tokenAddress,spenderAddress) {
	var functionSelector = "allowance(address,address)";
	var parameter = [{
		type: "address",
		value: userAddress
	}, {
		type: 'address',
		// 池子地址
		value: spenderAddress
	}];
	var options = {};

	var res = await tronWeb.transactionBuilder.triggerConstantContract(
		tokenAddress,
		functionSelector,
		options,
		parameter,
	);
	if (res && res.constant_result.length > 0) {
		return this.toChage_10(res.constant_result[0])
	}
	return 0
};


/**
 * 授权
 * @param {String} contractAddress 授权地址
 * @return {String} 授权结果
 */
mm_tron.prototype.approve = async function(tokenAddress,spenderAddress) {
	// var functionSelector = "allowance(address,address)";
	var functionSelector = "approve(address,uint256)";

	var parameter = [{
			type: "address",
			value: spenderAddress
		},
		{
			type: "uint256",
			value: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe"
		}
	];
	var options = {};
	let tx = await tronWeb.transactionBuilder.triggerSmartContract(
		tokenAddress,
		functionSelector,
		options,
		parameter
	);
	var signedTx = await tronWeb.trx.sign(tx.transaction);
	return await tronWeb.trx.sendRawTransaction(signedTx);
};

/**
 * 获取余额
 * @param {String} userAddress 用户地址
 */
mm_tron.prototype.balanceOf = async function(userAddress,tokenAddress) {
	var contractAddress = tokenAddress;

	var functionSelector = "balanceOf(address)";

	var parameter = [{
		type: "address",
		value: userAddress
	}];

	var options = {};
	
	var res =  await tronWeb.transactionBuilder.triggerConstantContract(
		contractAddress,
		functionSelector,
		options,
		parameter
	);
	if (res && res.constant_result.length > 0) {
		// console.log("balanceOf="+res.constant_result[0]);
		let b = this.toChage_10(res.constant_result[0],1);
		// console.log("b="+b+",decimals="+decimals);
		return b;
	}
	return 0
};


/**
 * 获取lp token 精度
 * @param {String} userAddress 用户地址
 */
mm_tron.prototype.decimals = async function(tokenAddress) {
	var functionSelector = "decimals()";

	var parameter = [];

	var options = {};
	
	var res =  await tronWeb.transactionBuilder.triggerConstantContract(
		tokenAddress,
		functionSelector,
		options,
		parameter
	);
	if (res && res.constant_result.length > 0) {
		let d = this.toChage_10(res.constant_result[0],1);
		return d;
	}
	return 18
};



mm_tron.prototype.stake = async function(amount) {
	let contractPool = this.config.contract_address;
	let ins = await tronWeb.contract().at(contractPool);

	return await ins.stake(amount).send({
		feeLimit: 100000000,
		callValue: 0,
		shouldPollResponse: true,
	});
};

$.mm_tron = mm_tron;
