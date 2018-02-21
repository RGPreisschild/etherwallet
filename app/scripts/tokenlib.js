'use strict';

var nodes = require('./nodes');

var ethFuncs = require('./ethFuncs');

var Token = function (contractAddress, userAddress, symbol, decimal, type, network, node) {
    this.contractAddress = contractAddress;
    this.userAddress = userAddress;
    this.symbol = symbol;
    this.decimal = decimal;
    this.type = type;
    this.balance = "loading";
    this.network = network;
    this.node = node;
};

Token.balanceHex = "0x70a08231";
Token.transferHex = "0xa9059cbb";
Token.popTokens = [];
Token.prototype.getContractAddress = function () {
    return this.contractAddress;
};
Token.prototype.getUserAddress = function () {
    return this.userAddress;
};
Token.prototype.setUserAddress = function (address) {
    this.userAddress = address;
};
Token.prototype.getSymbol = function () {
    return this.symbol;
};
Token.prototype.getDecimal = function () {
    return this.decimal;
};
Token.prototype.getBalance = function () {
    return this.balance;
};
Token.prototype.getBalanceBN = function () {
    return this.balanceBN;
};

Token.prototype.setBalance = function (balance) {

    this.balance = balance;
}

Token.prototype.fetchBalance = function () {

    const request_ = ethFuncs.getDataObj(this.contractAddress, Token.balanceHex, [ethFuncs.getNakedAddress(this.userAddress)]);



    // several nodes do not have getEthCall method

    const node_ = nodes.nodeList[this.node];

    const requestObj = node_ && node_.hasOwnProperty('lib') && node_.lib.hasOwnProperty('getEthCall') ? node_.lib : ajaxReq;

    this.setBalance('loading...');

    try {


        requestObj.getEthCall(request_, (data) => {
            if (!data.error && data.hasOwnProperty('data') && data.data !== '0x') {

                this.setBalance(new BigNumber(data.data).div(new BigNumber(10).pow(this.getDecimal())).toString());
                this.balanceBN = new BigNumber(data.data).toString();
                //if (callback) callback();

            } else {

                this.setBalance(globalFuncs.errorMsgs[20]);
                this.balanceBN = '0';

            }

        });
    } catch (e) {

        this.setBalance('0'); //globalFuncs.errorMsgs[20];
        this.balanceBN = '0';

        // console.error('error fetching token balance: ', request_);
    }
};

Token.getTokenByAddress = function (toAdd) {
    toAdd = ethFuncs.sanitizeHex(toAdd);
    for (var i = 0; i < Token.popTokens.length; i++) {
        if (toAdd.toLowerCase() === Token.popTokens[i].address.toLowerCase()) return Token.popTokens[i];
    }
    return {
        "address": toAdd,
        "symbol": "Unknown",
        "decimal": 0,
        "type": "default"
    }
};
Token.prototype.getData = function (toAdd, value) {
    try {
        if (!ethFuncs.validateEtherAddress(toAdd)) throw globalFuncs.errorMsgs[5];
        else if (!globalFuncs.isNumeric(value) || parseFloat(value) < 0) throw globalFuncs.errorMsgs[7];
        var value = ethFuncs.padLeft(new BigNumber(value).times(new BigNumber(10).pow(this.getDecimal())).toString(16), 64);
        var toAdd = ethFuncs.padLeft(ethFuncs.getNakedAddress(toAdd), 64);
        var data = Token.transferHex + toAdd + value;
        return {
            isError: false,
            data: data
        };
    } catch (e) {
        return {
            isError: true,
            error: e
        };
    }
};
module.exports = Token;
