// note: USDT, USDC decimal = 6

var ethconnected = false;
var ethaddress = '0x';
var balance = 0;
var web3 = new Web3(
	new Web3.providers.HttpProvider('https://mainnet.eth.aragon.network/')
);
var chefAddress = '0x6df6516569ab0297cae9142c9b3343b7e4ab5724'; // chef
var tokenAddress = '0xeeb92d7e5c0341bc0325a959851c83db51df13a3'; // burger token
var currentPageToken = '0x';
var currentPagePoolID = 0;
var currentPageWalletBalance = 0;
var currentPageStaked = 0;
var currentPageReward = 0;
//var uni0="";
var uni1 = '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc'; // usdc-eth
var prices = {
	burgereth: 0.1,
	burgerusd: 40,
	ethusdt: -1,
	yfieth: -1,
	sushieth: -1,
	susdeth: -1,
};
//contract,name,url,weight,yield
var pools = [
	[
		'0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
		'ETH/USDT',
		'https://uniswap.info/pair/0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
		1,
		0,
		0,
	],
	[
		'0x2fdbadf3c4d5a8666bc06645b8358ab803996e28',
		'YFI/ETH',
		'https://uniswap.info/pair/0x2fdbadf3c4d5a8666bc06645b8358ab803996e28',
		1,
		0,
		0,
	],
	[
		'0xce84867c3c02b05dc570d0135103d3fb9cc19433',
		'SUSHI/ETH',
		'https://uniswap.info/pair/0xce84867c3c02b05dc570d0135103d3fb9cc19433',
		1,
		0,
		0,
	],
	[
		'0xf80758ab42c3b07da84053fd88804bcb6baa4b5c',
		'sUSD/ETH',
		'https://uniswap.info/pair/0xf80758ab42c3b07da84053fd88804bcb6baa4b5c',
		1,
		0,
		0,
	],
	[
		'0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
		'USDC/ETH',
		'https://uniswap.info/pair/0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
		1,
		0,
		0,
	],
	[
		'0x923687DdD21B22AcA8cd6f227FcdE603737FfbE5',
		'WWT/ETH',
		'https://uniswap.info/pair/0x923687DdD21B22AcA8cd6f227FcdE603737FfbE5',
		4,
		0,
		0,
	],
];
var loadedpools = 0;
var totalPoolWeight = 14; // sum of weight
var uniswapABI = [
	{
		inputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'spender',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'value',
				type: 'uint256',
			},
		],
		name: 'Approval',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'sender',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount0',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount1',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'to',
				type: 'address',
			},
		],
		name: 'Burn',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'sender',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount0',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount1',
				type: 'uint256',
			},
		],
		name: 'Mint',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'sender',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount0In',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount1In',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount0Out',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount1Out',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'to',
				type: 'address',
			},
		],
		name: 'Swap',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint112',
				name: 'reserve0',
				type: 'uint112',
			},
			{
				indexed: false,
				internalType: 'uint112',
				name: 'reserve1',
				type: 'uint112',
			},
		],
		name: 'Sync',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'from',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'to',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'value',
				type: 'uint256',
			},
		],
		name: 'Transfer',
		type: 'event',
	},
	{
		constant: true,
		inputs: [],
		name: 'DOMAIN_SEPARATOR',
		outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'MINIMUM_LIQUIDITY',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'PERMIT_TYPEHASH',
		outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{ internalType: 'address', name: '', type: 'address' },
			{ internalType: 'address', name: '', type: 'address' },
		],
		name: 'allowance',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ internalType: 'address', name: 'spender', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
		],
		name: 'approve',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [{ internalType: 'address', name: 'to', type: 'address' }],
		name: 'burn',
		outputs: [
			{ internalType: 'uint256', name: 'amount0', type: 'uint256' },
			{ internalType: 'uint256', name: 'amount1', type: 'uint256' },
		],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'decimals',
		outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'factory',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'getReserves',
		outputs: [
			{ internalType: 'uint112', name: '_reserve0', type: 'uint112' },
			{ internalType: 'uint112', name: '_reserve1', type: 'uint112' },
			{
				internalType: 'uint32',
				name: '_blockTimestampLast',
				type: 'uint32',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ internalType: 'address', name: '_token0', type: 'address' },
			{ internalType: 'address', name: '_token1', type: 'address' },
		],
		name: 'initialize',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'kLast',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [{ internalType: 'address', name: 'to', type: 'address' }],
		name: 'mint',
		outputs: [
			{ internalType: 'uint256', name: 'liquidity', type: 'uint256' },
		],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'name',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'nonces',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ internalType: 'address', name: 'owner', type: 'address' },
			{ internalType: 'address', name: 'spender', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
			{ internalType: 'uint256', name: 'deadline', type: 'uint256' },
			{ internalType: 'uint8', name: 'v', type: 'uint8' },
			{ internalType: 'bytes32', name: 'r', type: 'bytes32' },
			{ internalType: 'bytes32', name: 's', type: 'bytes32' },
		],
		name: 'permit',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'price0CumulativeLast',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'price1CumulativeLast',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [{ internalType: 'address', name: 'to', type: 'address' }],
		name: 'skim',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ internalType: 'uint256', name: 'amount0Out', type: 'uint256' },
			{ internalType: 'uint256', name: 'amount1Out', type: 'uint256' },
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'bytes', name: 'data', type: 'bytes' },
		],
		name: 'swap',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'symbol',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [],
		name: 'sync',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'token0',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'token1',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'totalSupply',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
		],
		name: 'transfer',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ internalType: 'address', name: 'from', type: 'address' },
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
		],
		name: 'transferFrom',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
];
var erc20ABI = [
	{
		inputs: [
			{
				internalType: 'string',
				name: 'name',
				type: 'string',
			},
			{
				internalType: 'string',
				name: 'symbol',
				type: 'string',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'spender',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'value',
				type: 'uint256',
			},
		],
		name: 'Approval',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'from',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'to',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'value',
				type: 'uint256',
			},
		],
		name: 'Transfer',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
			{
				internalType: 'address',
				name: 'spender',
				type: 'address',
			},
		],
		name: 'allowance',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'spender',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
		],
		name: 'approve',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
		],
		name: 'balanceOf',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'decimals',
		outputs: [
			{
				internalType: 'uint8',
				name: '',
				type: 'uint8',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'spender',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'subtractedValue',
				type: 'uint256',
			},
		],
		name: 'decreaseAllowance',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'spender',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'addedValue',
				type: 'uint256',
			},
		],
		name: 'increaseAllowance',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'name',
		outputs: [
			{
				internalType: 'string',
				name: '',
				type: 'string',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'symbol',
		outputs: [
			{
				internalType: 'string',
				name: '',
				type: 'string',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'totalSupply',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'recipient',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
		],
		name: 'transfer',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'sender',
				type: 'address',
			},
			{
				internalType: 'address',
				name: 'recipient',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
		],
		name: 'transferFrom',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
];
var chefABI = [
	{
		inputs: [
			{
				internalType: 'contract BurgerToken',
				name: '_burger',
				type: 'address',
			},
			{ internalType: 'address', name: '_devaddr', type: 'address' },
			{
				internalType: 'uint256',
				name: '_burgerPerBlock',
				type: 'uint256',
			},
			{ internalType: 'uint256', name: '_startBlock', type: 'uint256' },
			{
				internalType: 'uint256',
				name: '_bonusEndBlock',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'uint256',
				name: 'pid',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
		],
		name: 'Deposit',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'uint256',
				name: 'pid',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
		],
		name: 'EmergencyWithdraw',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'previousOwner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'OwnershipTransferred',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'uint256',
				name: 'pid',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
		],
		name: 'Withdraw',
		type: 'event',
	},
	{
		inputs: [],
		name: 'BONUS_MULTIPLIER',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '_allocPoint', type: 'uint256' },
			{
				internalType: 'contract IERC20',
				name: '_lpToken',
				type: 'address',
			},
			{ internalType: 'bool', name: '_withUpdate', type: 'bool' },
		],
		name: 'add',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'bonusEndBlock',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'burger',
		outputs: [
			{ internalType: 'contract BurgerToken', name: '', type: 'address' },
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'burgerPerBlock',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '_pid', type: 'uint256' },
			{ internalType: 'uint256', name: '_amount', type: 'uint256' },
		],
		name: 'deposit',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: '_devaddr', type: 'address' },
		],
		name: 'dev',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'devaddr',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '_pid', type: 'uint256' }],
		name: 'emergencyWithdraw',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '_from', type: 'uint256' },
			{ internalType: 'uint256', name: '_to', type: 'uint256' },
		],
		name: 'getMultiplier',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'massUpdatePools',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '_pid', type: 'uint256' },
			{ internalType: 'address', name: '_user', type: 'address' },
		],
		name: 'pendingBurger',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		name: 'poolInfo',
		outputs: [
			{
				internalType: 'contract IERC20',
				name: 'lpToken',
				type: 'address',
			},
			{ internalType: 'uint256', name: 'allocPoint', type: 'uint256' },
			{
				internalType: 'uint256',
				name: 'lastRewardBlock',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'accBurgerPerShare',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'poolLength',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'renounceOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '_pid', type: 'uint256' },
			{ internalType: 'uint256', name: '_allocPoint', type: 'uint256' },
			{ internalType: 'bool', name: '_withUpdate', type: 'bool' },
		],
		name: 'set',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'startBlock',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'totalAllocPoint',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'newOwner', type: 'address' },
		],
		name: 'transferOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '_pid', type: 'uint256' }],
		name: 'updatePool',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '', type: 'uint256' },
			{ internalType: 'address', name: '', type: 'address' },
		],
		name: 'userInfo',
		outputs: [
			{ internalType: 'uint256', name: 'amount', type: 'uint256' },
			{ internalType: 'uint256', name: 'rewardDebt', type: 'uint256' },
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '_pid', type: 'uint256' },
			{ internalType: 'uint256', name: '_amount', type: 'uint256' },
		],
		name: 'withdraw',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
];

var tokenABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'spender',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'value',
				type: 'uint256',
			},
		],
		name: 'Approval',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'previousOwner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'OwnershipTransferred',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'from',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'to',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'value',
				type: 'uint256',
			},
		],
		name: 'Transfer',
		type: 'event',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'owner', type: 'address' },
			{ internalType: 'address', name: 'spender', type: 'address' },
		],
		name: 'allowance',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'spender', type: 'address' },
			{ internalType: 'uint256', name: 'amount', type: 'uint256' },
		],
		name: 'approve',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'decimals',
		outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'spender', type: 'address' },
			{
				internalType: 'uint256',
				name: 'subtractedValue',
				type: 'uint256',
			},
		],
		name: 'decreaseAllowance',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'spender', type: 'address' },
			{ internalType: 'uint256', name: 'addedValue', type: 'uint256' },
		],
		name: 'increaseAllowance',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: '_to', type: 'address' },
			{ internalType: 'uint256', name: '_amount', type: 'uint256' },
		],
		name: 'mint',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'name',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'renounceOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'symbol',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'totalSupply',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'recipient', type: 'address' },
			{ internalType: 'uint256', name: 'amount', type: 'uint256' },
		],
		name: 'transfer',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'sender', type: 'address' },
			{ internalType: 'address', name: 'recipient', type: 'address' },
			{ internalType: 'uint256', name: 'amount', type: 'uint256' },
		],
		name: 'transferFrom',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'newOwner', type: 'address' },
		],
		name: 'transferOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
];

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

	var ctx3 = new web3.eth.Contract(uniswapABI, pools[1][0]);
	ctx3.methods.getReserves().call(function (err, result1) {
		ctx3.methods.totalSupply().call(function (err, result2) {
			ctx3.methods.balanceOf(chefAddress).call(function (err, result3) {
				//console.log('YFI/ETH ctx3:',result1['_reserve0'],result1['_reserve1']);
				var totalSupply = result2; // total supply of UNI-V2
				var stakedSupply = result3; // staked amount in chef
				//console.log(result2,result3);
				var percentageOfSupplyInPool = stakedSupply / totalSupply;
				// total liquidity ~ 2*(single token liquidity)*(staked percentage), reserve0 = YFI (18), reserve1 = ETH (18)
				pools[1][4] =
					(((perpoolunit * prices['burgereth']) /
						((result1['_reserve1'] * 2) / Math.pow(10, 18))) *
						100 *
						pools[1][3]) /
					percentageOfSupplyInPool;
				pools[1][5] =
					((prices['ethusd'] * result1['_reserve1'] * 2) /
						Math.pow(10, 18)) *
					percentageOfSupplyInPool;
				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit,result1['_reserve1']/Math.pow(10,18),pools[1][3]);
				$('.pool1yield').animateNumbers(parseInt(pools[1][4]) + '%');
				loadedPool();
			});
		});
	});

	var ctx4 = new web3.eth.Contract(uniswapABI, pools[2][0]);
	ctx4.methods.getReserves().call(function (err, result1) {
		ctx4.methods.totalSupply().call(function (err, result2) {
			ctx4.methods.balanceOf(chefAddress).call(function (err, result3) {
				//console.log('YFI/ETH ctx3:',result1['_reserve0'],result1['_reserve1']);
				var totalSupply = result2; // total supply of UNI-V2
				var stakedSupply = result3; // staked amount in chef
				//console.log(result2,result3);
				var percentageOfSupplyInPool = stakedSupply / totalSupply;
				// total liquidity ~ 2*(single token liquidity)*(staked percentage), reserve0 = SUSHI (18), reserve1 = ETH (18)
				pools[2][4] =
					(((perpoolunit * prices['burgereth']) /
						((result1['_reserve1'] * 2) / Math.pow(10, 18))) *
						100 *
						pools[2][3]) /
					percentageOfSupplyInPool;
				pools[2][5] =
					((prices['ethusd'] * result1['_reserve1'] * 2) /
						Math.pow(10, 18)) *
					percentageOfSupplyInPool;

				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit,result1['_reserve1']/Math.pow(10,18),pools[2][3]);
				$('.pool2yield').animateNumbers(parseInt(pools[2][4]) + '%');
				loadedPool();
			});
		});
	});

	var ctx5 = new web3.eth.Contract(uniswapABI, pools[3][0]);
	ctx5.methods.getReserves().call(function (err, result1) {
		ctx5.methods.totalSupply().call(function (err, result2) {
			ctx5.methods.balanceOf(chefAddress).call(function (err, result3) {
				//console.log('sUSD/ETH ctx5:',result1['_reserve0'],result1['_reserve1']);
				var totalSupply = result2; // total supply of UNI-V2
				var stakedSupply = result3; // staked amount in chef
				//console.log(result2,result3);
				var percentageOfSupplyInPool = stakedSupply / totalSupply;
				// total liquidity ~ 2*(single token liquidity)*(staked percentage), reserve0 = sUSD (18), reserve1 = ETH (18)
				pools[3][4] =
					(((perpoolunit * prices['burgereth']) /
						((result1['_reserve1'] * 2) / Math.pow(10, 18))) *
						100 *
						pools[3][3]) /
					percentageOfSupplyInPool;
				pools[3][5] =
					((prices['ethusd'] * result1['_reserve1'] * 2) /
						Math.pow(10, 18)) *
					percentageOfSupplyInPool;
				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit,result1['_reserve1']/Math.pow(10,18),pools[3][3]);
				$('.pool3yield').animateNumbers(parseInt(pools[3][4]) + '%');
				loadedPool();
			});
		});
	});

	var ctx6 = new web3.eth.Contract(uniswapABI, pools[4][0]);
	ctx6.methods.getReserves().call(function (err, result1) {
		ctx6.methods.totalSupply().call(function (err, result2) {
			ctx6.methods.balanceOf(chefAddress).call(function (err, result3) {
				//console.log('USDC/ETH ctx6:',result1['_reserve0'],result1['_reserve1']);
				var totalSupply = result2; // total supply of UNI-V2
				var stakedSupply = result3; // staked amount in chef
				//console.log(result2,result3);
				var percentageOfSupplyInPool = stakedSupply / totalSupply;
				// total liquidity ~ 2*(single token liquidity)*(staked percentage), reserve1 = USDC (6), reserve0 = ETH (18)
				pools[4][4] =
					(((perpoolunit * prices['burgereth']) /
						((result1['_reserve1'] * 2) / Math.pow(10, 18))) *
						100 *
						pools[4][3]) /
					percentageOfSupplyInPool;
				pools[4][5] =
					((prices['ethusd'] * result1['_reserve1'] * 2) /
						Math.pow(10, 18)) *
					percentageOfSupplyInPool;
				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit,result1['_reserve1']/Math.pow(10,18),pools[4][3]);
				$('.pool4yield').animateNumbers(parseInt(pools[4][4]) + '%');
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

	// var ctx1 = new web3.eth.Contract(uniswapABI, pools[6][0]);
	// ctx1.methods.getReserves().call(function (err, result1) {
	// 	ctx1.methods.totalSupply().call(function (err, result2) {
	// 		ctx1.methods.balanceOf(chefAddress).call(function (err, result3) {
	// 			//console.log('BURGER with SUDHI ctx1:',result1['_reserve0'],result1['_reserve1']);
	// 			var totalSupply = result2; // total supply of UNI-V2
	// 			var stakedSupply = result3; // staked amount in chef
	// 			var percentageOfSupplyInPool = stakedSupply / totalSupply;
	// 			//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit);
	// 			// total liquidity ~ 2*(single token liquidity)*(staked percentage), reserve1 = burger, reserve0 = usdt
	// 			pools[6][4] =
	// 				((perpoolunit /
	// 					((result1['_reserve1'] * 2) / Math.pow(10, 18))) *
	// 					100 *
	// 					pools[6][3]) /
	// 				percentageOfSupplyInPool;
	// 			pools[6][5] =
	// 				((prices['burgerusd'] * result1['_reserve1'] * 2) /
	// 					Math.pow(10, 18)) *
	// 				percentageOfSupplyInPool;
	// 			//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit,result1['_reserve0']/Math.pow(10,18),pools[6][3]);
	// 			$('.pool6yield').animateNumbers(parseInt(pools[6][4]) + '%');
	// 			loadedPool();
	// 		});
	// 	});
	// });
}

async function connectWeb3() {
	if (window.ethereum) {
		window.web3 = new Web3(window.ethereum);
		conn = await window.ethereum.enable();
		//console.log(conn.length)

		ethconnected = conn.length > 0;
		if (ethconnected) {
			ethaddress = conn[0];
		}
		updateConnectStatus();
		web3.eth.getAccounts(); //.then(console.log);

		return true;
	}
}

function updateConnectStatus() {
	if (ethconnected) {
		$('body').addClass('web3');
	}
	getBalance(ethaddress);
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
	var contract = new web3.eth.Contract(tokenABI, tokenAddress);
	contract.methods.balanceOf(address).call(function (error, result) {
		contract.methods.decimals().call(function (error, d) {
			result = result / Math.pow(10, d);
			//console.log(error, result);
			$('.balance').text(result.toFixedSpecial(2) + ' WWT');
			balance = result;
		});
	});
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
	$('.farmname').text(pools[id][1] + ' pool');
	currentPageToken = pools[id][0];
	currentPagePoolID = id;
	//get yield balance

	//get staked balance
	//if larger than zero, approved

	var contract = new web3.eth.Contract(chefABI, chefAddress);
	contract.methods
		.userInfo(currentPagePoolID, ethaddress)
		.call(function (error, result) {
			currentPageStaked = result[0];
			result[0] = (result[0] / Math.pow(10, 18)).toFixedSpecial(7);
			//console.log(error, result)
			$('.stakedbalance').text(result[0]);
		});

	var pagetoken = new web3.eth.Contract(erc20ABI, currentPageToken);
	pagetoken.methods
		.allowance(ethaddress, chefAddress)
		.call(function (error, result) {
			if (result > 0) {
				$('body').addClass('approved');
			}
		});

	contract.methods
		.pendingBurger(currentPagePoolID, ethaddress)
		.call(function (error, result) {
			currentPageReward = result;
			result = (result / Math.pow(10, 18)).toFixedSpecial(3);
			//console.log(error, result)
			$('.rewardbalance').animateNumbers(result);
		});

	//get wallet balance

	var contract = new web3.eth.Contract(erc20ABI, currentPageToken);
	contract.methods.balanceOf(ethaddress).call(function (error, result) {
		contract.methods.decimals().call(function (error, d) {
			currentPageWalletBalance = result;
			result = (result / Math.pow(10, d)).toFixedSpecial(7);
			//console.log(error, result)
			$('.walletbalance').text(result);
		});
	});
}
function approveSpend() {
	var contract = new web3.eth.Contract(erc20ABI, currentPageToken);

	contract.methods
		.approve(
			chefAddress,
			'10000000000000000000000000000000000000000000000000000000'
		)
		.send({ from: ethaddress }, function (err, transactionHash) {
			//some code
			alert(
				'Please wait until the approve transaction confirm to stake your pool token. You can refresh the page to update'
			);

			var subscription = web3.eth
				.subscribe('pendingTransactions', function (error, result) {
					if (!error) addToPool();
				})
				.on('data', function (transaction) {
					//console.log(transaction);
				});

			$('body').addClass('approved');
			// console.log(transactionHash);
		});
}
function addToPool() {
	var contract = new web3.eth.Contract(chefABI, chefAddress);
	var amount = prompt(
		'Amount to stake',
		(currentPageWalletBalance - 1000000) / Math.pow(10, 18)
	); // to fix round error due to JS

	contract.methods
		.deposit(
			currentPagePoolID,
			(amount * Math.pow(10, 18) - 100).toFixedSpecial(0)
		)
		.send({ from: ethaddress }, function (err, transactionHash) {
			//console.log(transactionHash)
		});
}
function claimReward() {
	var contract = new web3.eth.Contract(chefABI, chefAddress);
	contract.methods
		.deposit(currentPagePoolID, 0)
		.send({ from: ethaddress }, function (err, transactionHash) {
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
		.send({ from: ethaddress }, function (err, transactionHash) {
			//some code
			//console.log(transactionHash)
		});
}
function getUniswapPrice() {
	var ctx0 = new web3.eth.Contract(uniswapABI, pools[5][0]); // burger-eth
	var ctx1 = new web3.eth.Contract(uniswapABI, uni1); // usdc-eth
	try {
		ctx0.methods.getReserves().call(function (err, result1) {
			//console.log(err,result1);
			ctx1.methods.getReserves().call(function (err, result2) {
				var burgereth = result1['_reserve0'] / result1['_reserve1'];

				prices['burgereth'] = burgereth;

				// // eth/usd approximation by ETH-USDC pair
				var ethusd =
					(result2['_reserve0'] / result2['_reserve1']) *
					Math.pow(10, 18 - 6); // cause USDC uses 6 decimal
				prices['ethusd'] = ethusd;

				var burgerusd = burgereth * ethusd;
				prices['burgerusd'] = burgerusd;
				getSupply();

				updatePrice(prices['burgerusd']);
			});
		});
	} catch (e) {
		console.error(e);
	}
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
	$('.tokenprice').text('$' + p.toFixedSpecial(7));
	updateYield();
}
function getlptoken(id) {
	if (typeof id === 'undefined') {
		window.open(pools[currentPagePoolID][2]);
	} else {
		window.open(pools[id][2]);
	}
}
function init() {
	connectWeb3();
}
init();
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
getUniswapPrice();

setInterval(function () {
	initpooldata(currentPagePoolID);
	getUniswapPrice();
}, 30000);
