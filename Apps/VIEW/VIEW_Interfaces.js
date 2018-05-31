/* 
 * Copyright (c) 2017, Mihail Maldzhanski
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var tablePortsInit =
        {
            pPort_Err0001: 'pPort is NOT connected',
            pPort_Err0002: 'pPort is NOT connected',
            pPort_Err0003: 'pPort is NOT connected',
            pPort_Err0004: 'pPort is NOT connected',
            pPort_Err0005: 'pPort is NOT connected',
            pPort_Err0006: 'pPort is NOT connected',
            pPort_Err0007: 'pPort is NOT connected',
            pPort_Err0008: 'pPort is NOT connected',
            pPort_Err0009: 'pPort is NOT connected',
            pPort_Err0010: 'pPort is NOT connected',
            pPort_Err0011: 'pPort is NOT connected',
            pPort_Err0012: 'pPort is NOT connected',
            pPort_Err0013: 'pPort is NOT connected',
            pPort_Err0014: 'pPort is NOT connected',
            pPort_Err0015: 'pPort is NOT connected',
            pPort_Err0016: 'pPort is NOT connected',
            pPort_Err0017: 'pPort is NOT connected',
            pPort_Err0018: 'pPort is NOT connected',
            pPort_Err0019: 'pPort is NOT connected',
            pPort_Err0020: 'pPort is NOT connected',
            pPort_Warn0021: 'pPort is NOT connected',
            pPort_Warn0022: 'pPort is NOT connected',
            pPort_Warn0023: 'pPort is NOT connected',
            pPort_Warn0024: 'pPort is NOT connected',
            pPort_Warn0025: 'pPort is NOT connected',
            pPort_Warn0026: 'pPort is NOT connected',
            pPort_Warn0027: 'pPort is NOT connected',
            pPort_Warn0028: 'pPort is NOT connected',
            pPort_Warn0029: 'pPort is NOT connected',
            pPort_Warn0030: 'pPort is NOT connected',
            pPort_Warn0031: 'pPort is NOT connected',
            pPort_Warn0032: 'pPort is NOT connected',
            pPort_Warn0033: 'pPort is NOT connected',
            pPort_Warn0034: 'pPort is NOT connected',
            pPort_Warn0035: 'pPort is NOT connected',
            pPort_Warn0036: 'pPort is NOT connected',
            pPort_Warn0037: 'pPort is NOT connected',
            pPort_Warn0038: 'pPort is NOT connected',
            pPort_Warn0039: 'pPort is NOT connected',
            pPort_Warn0040: 'pPort is NOT connected',
            pPort_Warn0041: 'pPort is NOT connected',
            pPort_Warn0042: 'pPort is NOT connected',
            pPort_Warn0043: 'pPort is NOT connected',
            pPort_Warn0044: 'pPort is NOT connected',
            pPort_Warn0045: 'pPort is NOT connected',
            pPort_Warn0046: 'pPort is NOT connected',
            pPort_Warn0047: 'pPort is NOT connected',
            pPort_Warn0048: 'pPort is NOT connected',
            pPort_Warn0049: 'pPort is NOT connected',
            pPort_Warn0050: 'pPort is NOT connected',
            pPort_UsInf0051: 'pPort is NOT connected',
            pPort_UsInf0052: 'pPort is NOT connected',
            pPort_UsInf0053: 'pPort is NOT connected',
            pPort_UsInf0054: 'pPort is NOT connected',
            pPort_UsInf0055: 'pPort is NOT connected',
            pPort_UsInf0056: 'pPort is NOT connected',
            pPort_UsInf0057: 'pPort is NOT connected',
            pPort_UsInf0058: 'pPort is NOT connected',
            pPort_UsInf0059: 'pPort is NOT connected',
            pPort_UsInf0060: 'pPort is NOT connected',
            pPort_UsInf0061: 'pPort is NOT connected',
            pPort_UsInf0062: 'pPort is NOT connected',
            pPort_UsInf0063: 'pPort is NOT connected',
            pPort_UsInf0064: 'pPort is NOT connected',
            pPort_UsInf0065: 'pPort is NOT connected',
            pPort_UsInf0066: 'pPort is NOT connected',
            pPort_UsInf0067: 'pPort is NOT connected',
            pPort_UsInf0068: 'pPort is NOT connected',
            pPort_UsInf0069: 'pPort is NOT connected',
            pPort_UsInf0070: 'pPort is NOT connected',
            pPort_UsInf0071: 'pPort is NOT connected',
            pPort_UsInf0072: 'pPort is NOT connected',
            pPort_UsInf0073: 'pPort is NOT connected',
            pPort_UsInf0074: 'pPort is NOT connected',
            pPort_UsInf0075: 'pPort is NOT connected',
            pPort_UsInf0076: 'pPort is NOT connected',
            pPort_UsInf0077: 'pPort is NOT connected',
            pPort_UsInf0078: 'pPort is NOT connected',
            pPort_UsInf0079: 'pPort is NOT connected',
            pPort_UsInf0080: 'pPort is NOT connected',
            pPort_UsInf0081: 'pPort is NOT connected',
            pPort_UsInf0082: 'pPort is NOT connected',
            pPort_UsInf0083: 'pPort is NOT connected',
            pPort_UsInf0084: 'pPort is NOT connected',
            pPort_UsInf0085: 'pPort is NOT connected',
            pPort_UsInf0086: 'pPort is NOT connected',
            pPort_UsInf0087: 'pPort is NOT connected',
            pPort_UsInf0088: 'pPort is NOT connected',
            pPort_UsInf0089: 'pPort is NOT connected',
            pPort_UsInf0090: 'pPort is NOT connected',
            pPort_UsInf0091: 'pPort is NOT connected',
            pPort_UsInf0092: 'pPort is NOT connected',
            pPort_UsInf0093: 'pPort is NOT connected',
            pPort_UsInf0094: 'pPort is NOT connected',
            pPort_UsInf0095: 'pPort is NOT connected',
            pPort_UsInf0096: 'pPort is NOT connected',
            pPort_UsInf0097: 'pPort is NOT connected',
            pPort_UsInf0098: 'pPort is NOT connected',
            pPort_UsInf0099: 'pPort is NOT connected',
            pPort_UsInf0100: 'pPort is NOT connected',
            pPort_UsInf0101: 'pPort is NOT connected',
            pPort_UsInf0102: 'pPort is NOT connected',
            pPort_UsInf0103: 'pPort is NOT connected',
            pPort_UsInf0104: 'pPort is NOT connected',
            pPort_UsInf0105: 'pPort is NOT connected',
            pPort_UsInf0106: 'pPort is NOT connected',
            pPort_UsInf0107: 'pPort is NOT connected',
            pPort_UsInf0108: 'pPort is NOT connected',
            pPort_UsInf0109: 'pPort is NOT connected',
            pPort_UsInf0110: 'pPort is NOT connected',
            pPort_DevInf0111: 'pPort is NOT connected',
            pPort_DevInf0112: 'pPort is NOT connected',
            pPort_DevInf0113: 'pPort is NOT connected',
            pPort_DevInf0114: 'pPort is NOT connected',
            pPort_DevInf0115: 'pPort is NOT connected',
            pPort_DevInf0116: 'pPort is NOT connected',
            pPort_DevInf0117: 'pPort is NOT connected',
            pPort_DevInf0118: 'pPort is NOT connected',
            pPort_DevInf0119: 'pPort is NOT connected',
            pPort_DevInf0120: 'pPort is NOT connected',
            pPort_DevInf0121: 'pPort is NOT connected',
            pPort_DevInf0122: 'pPort is NOT connected',
            pPort_DevInf0123: 'pPort is NOT connected',
            pPort_DevInf0124: 'pPort is NOT connected',
            pPort_DevInf0125: 'pPort is NOT connected',
            pPort_DevInf0126: 'pPort is NOT connected',
            pPort_DevInf0127: 'pPort is NOT connected',
            pPort_DevInf0128: 'pPort is NOT connected',
            pPort_DevInf0129: 'pPort is NOT connected',
            pPort_DevInf0130: 'pPort is NOT connected'
        };

function getTable(tablePorts) {
    var tableCodes = {
        ERROR: {Err0001: {str: 'Cannot connect to Operator. No Active Operator', data: tablePorts.pPort_Err0001}, Err0002: {str: 'Ip/Port is busy', data: tablePorts.pPort_Err0002}, Err0003: {str: 'Cannot process command', data: tablePorts.pPort_Err0003}, Err0004: {str: 'Error in configuration file', data: tablePorts.pPort_Err0004}, Err0005: {str: 'Invalid Count of Arguments', data: tablePorts.pPort_Err0005}, Err0006: {str: 'Invalid data from server (cannot be decrypted)', data: tablePorts.pPort_Err0006}, Err0007: {str: 'Invalid certificate excahange', data: tablePorts.pPort_Err0007}, Err0008: {str: 'Invalid digital address of operator', data: tablePorts.pPort_Err0008}, Err0009: {str: 'There is no active MySQL server on %s', data: tablePorts.pPort_Err0009}, Err0010: {str: '', data: tablePorts.pPort_Err0010}, Err0011: {str: '', data: tablePorts.pPort_Err0011}, Err0012: {str: '', data: tablePorts.pPort_Err0012}, Err0013: {str: '', data: tablePorts.pPort_Err0013}, Err0014: {str: '', data: tablePorts.pPort_Err0014}, Err0015: {str: '', data: tablePorts.pPort_Err0015}, Err0016: {str: '', data: tablePorts.pPort_Err0016}, Err0017: {str: '', data: tablePorts.pPort_Err0017}, Err0018: {str: '', data: tablePorts.pPort_Err0018}, Err0019: {str: '', data: tablePorts.pPort_Err0019}, Err0020: {str: '', data: tablePorts.pPort_Err0020}},
        WARNING: {Warn0021: {str: 'TCP Connection Closed', data: tablePorts.pPort_Warn0021}, Warn0022: {str: 'Client spontaneous disconnected.', data: tablePorts.pPort_Warn0022}, Warn0023: {str: 'Error DICE Unit has Invalid Value', data: tablePorts.pPort_Warn0023}, Warn0024: {str: 'Error Mismatch with Current Owner', data: tablePorts.pPort_Warn0024}, Warn0025: {str: 'Error New owner was already set', data: tablePorts.pPort_Warn0025}, Warn0026: {str: 'Error Mismatch New Owner field and requested address', data: tablePorts.pPort_Warn0026}, Warn0027: {str: 'Error Mismatch New Owner field and claimed owner', data: tablePorts.pPort_Warn0027}, Warn0028: {str: 'Error DICE Unit Exist in DB', data: tablePorts.pPort_Warn0028}, Warn0029: {str: 'Error Operator Address does not match with Operator Address in Prototype', data: tablePorts.pPort_Warn0029}, Warn0030: {str: 'Updating from cloud FAILED', data: tablePorts.pPort_Warn0030}, Warn0031: {str: '', data: tablePorts.pPort_Warn0031}, Warn0032: {str: '', data: tablePorts.pPort_Warn0032}, Warn0033: {str: '', data: tablePorts.pPort_Warn0033}, Warn0034: {str: '', data: tablePorts.pPort_Warn0034}, Warn0035: {str: '', data: tablePorts.pPort_Warn0035}, Warn0036: {str: '', data: tablePorts.pPort_Warn0036}, Warn0037: {str: '', data: tablePorts.pPort_Warn0037}, Warn0038: {str: '', data: tablePorts.pPort_Warn0038}, Warn0039: {str: '', data: tablePorts.pPort_Warn0039}, Warn0040: {str: '', data: tablePorts.pPort_Warn0040}, Warn0041: {str: '', data: tablePorts.pPort_Warn0041}, Warn0042: {str: '', data: tablePorts.pPort_Warn0042}, Warn0043: {str: '', data: tablePorts.pPort_Warn0043}, Warn0044: {str: '', data: tablePorts.pPort_Warn0044}, Warn0045: {str: '', data: tablePorts.pPort_Warn0045}, Warn0046: {str: '', data: tablePorts.pPort_Warn0046}, Warn0047: {str: '', data: tablePorts.pPort_Warn0047}, Warn0048: {str: '', data: tablePorts.pPort_Warn0048}, Warn0049: {str: '', data: tablePorts.pPort_Warn0049}, Warn0050: {str: '', data: tablePorts.pPort_Warn0050}},
        USER_INFO: {UsInf0051: {str: 'User settings for value of new DICE Unit: %s', data: tablePorts.pPort_UsInf0051}, UsInf0052: {str: 'DICE Value: %s', data: tablePorts.pPort_UsInf0052}, UsInf0053: {str: 'Generating new Digital Address and Key Pair', data: tablePorts.pPort_UsInf0053}, UsInf0054: {str: 'Exit from Program', data: tablePorts.pPort_UsInf0054}, UsInf0055: {str: 'SHA3 Speed [hash/s]: %s ', data: tablePorts.pPort_UsInf0055}, UsInf0056: {str: 'Calculate new DICE Unit with Level - %s Operator Threshold', data: tablePorts.pPort_UsInf0056}, UsInf0057: {str: 'Saving generated Unit to %s', data: tablePorts.pPort_UsInf0057}, UsInf0058: {str: 'Hash value of Prototype: %s', data: tablePorts.pPort_UsInf0058}, UsInf0059: {str: 'Base 58 Key:  %s', data: tablePorts.pPort_UsInf0059}, UsInf0060: {str: 'Base 58 Addr: %s', data: tablePorts.pPort_UsInf0060}, UsInf0061: {str: 'Unit Content in HEX', data: tablePorts.pPort_UsInf0061}, UsInf0062: {str: 'Operator Address: %s', data: tablePorts.pPort_UsInf0062}, UsInf0063: {str: 'Miner Address: %s', data: tablePorts.pPort_UsInf0063}, UsInf0064: {str: 'Traling Zeroes:  %s', data: tablePorts.pPort_UsInf0064}, UsInf0065: {str: 'Time: %s', data: tablePorts.pPort_UsInf0065}, UsInf0066: {str: 'Payload: %s', data: tablePorts.pPort_UsInf0066}, UsInf0067: {str: 'Operator Response Message', data: tablePorts.pPort_UsInf0067}, UsInf0068: {str: 'Response Status: %s', data: tablePorts.pPort_UsInf0068}, UsInf0069: {str: 'Current Owner: %s', data: tablePorts.pPort_UsInf0069}, UsInf0070: {str: 'DICE Value: %s', data: tablePorts.pPort_UsInf0070}, UsInf0071: {str: 'Hash value of Prototype: %s', data: tablePorts.pPort_UsInf0071}, UsInf0072: {str: 'End of Operator Response Message', data: tablePorts.pPort_UsInf0072}, UsInf0073: {str: 'DICE Unit successfully registered in Data Base', data: tablePorts.pPort_UsInf0073}, UsInf0074: {str: 'DICE Value: %s', data: tablePorts.pPort_UsInf0074}, UsInf0075: {str: 'Claim accepted!', data: tablePorts.pPort_UsInf0075}, UsInf0076: {str: 'New owner accepted!', data: tablePorts.pPort_UsInf0076}, UsInf0077: {str: 'New configuration applied at: %s', data: tablePorts.pPort_UsInf0077}, UsInf0078: {str: 'Operator Threshold: %s ', data: tablePorts.pPort_UsInf0078}, UsInf0079: {str: 'Global Threshold: %s', data: tablePorts.pPort_UsInf0079}, UsInf0080: {str: 'Digital Address: %s', data: tablePorts.pPort_UsInf0080}, UsInf0081: {str: 'IP: %s', data: tablePorts.pPort_UsInf0081}, UsInf0082: {str: 'Port: %s', data: tablePorts.pPort_UsInf0082}, UsInf0083: {str: 'Operator Running', data: tablePorts.pPort_UsInf0083}, UsInf0084: {str: 'New added Unit %s', data: tablePorts.pPort_UsInf0084}, UsInf0085: {str: 'Imported configration', data: tablePorts.pPort_UsInf0085}, UsInf0086: {str: 'New Contact Added', data: tablePorts.pPort_UsInf0086}, UsInf0087: {str: 'New Operator Added', data: tablePorts.pPort_UsInf0087}, UsInf0088: {str: 'Created New configration file', data: tablePorts.pPort_UsInf0088}, UsInf0089: {str: 'DNS Updated', data: tablePorts.pPort_UsInf0089}, UsInf0090: {str: 'Balance %s', data: tablePorts.pPort_UsInf0090}, UsInf0091: {str: 'DICE Scrapped unit successfully registered ', data: tablePorts.pPort_UsInf0091}, UsInf0092: {str: '', data: tablePorts.pPort_UsInf0092}, UsInf0093: {str: '', data: tablePorts.pPort_UsInf0093}, UsInf0094: {str: '', data: tablePorts.pPort_UsInf0094}, UsInf0095: {str: '', data: tablePorts.pPort_UsInf0095}, UsInf0096: {str: '', data: tablePorts.pPort_UsInf0096}, UsInf0097: {str: '', data: tablePorts.pPort_UsInf0097}, UsInf0098: {str: '', data: tablePorts.pPort_UsInf0098}, UsInf0099: {str: '', data: tablePorts.pPort_UsInf0099}, UsInf0100: {str: '', data: tablePorts.pPort_UsInf0100}, UsInf0101: {str: '', data: tablePorts.pPort_UsInf0101}, UsInf0102: {str: '', data: tablePorts.pPort_UsInf0102}, UsInf0103: {str: '', data: tablePorts.pPort_UsInf0103}, UsInf0104: {str: '', data: tablePorts.pPort_UsInf0104}, UsInf0105: {str: '', data: tablePorts.pPort_UsInf0105}, UsInf0106: {str: '', data: tablePorts.pPort_UsInf0106}, UsInf0107: {str: '', data: tablePorts.pPort_UsInf0107}, UsInf0108: {str: '', data: tablePorts.pPort_UsInf0108}, UsInf0109: {str: '', data: tablePorts.pPort_UsInf0109}, UsInf0110: {str: '', data: tablePorts.pPort_UsInf0110}},
        DEV_INFO: {DevInf0111: {str: 'Base Hex Key:  %s', data: tablePorts.pPort_DevInf0111}, DevInf0112: {str: 'Base Hex Addr: %s', data: tablePorts.pPort_DevInf0112}, DevInf0113: {str: 'Data received: %s', data: tablePorts.pPort_DevInf0113}, DevInf0114: {str: '', data: tablePorts.pPort_DevInf0114}, DevInf0115: {str: '', data: tablePorts.pPort_DevInf0115}, DevInf0116: {str: '', data: tablePorts.pPort_DevInf0116}, DevInf0117: {str: '', data: tablePorts.pPort_DevInf0117}, DevInf0118: {str: '', data: tablePorts.pPort_DevInf0118}, DevInf0119: {str: '', data: tablePorts.pPort_DevInf0119}, DevInf0120: {str: '', data: tablePorts.pPort_DevInf0120}, DevInf0121: {str: '', data: tablePorts.pPort_DevInf0121}, DevInf0122: {str: '', data: tablePorts.pPort_DevInf0122}, DevInf0123: {str: '', data: tablePorts.pPort_DevInf0123}, DevInf0124: {str: '', data: tablePorts.pPort_DevInf0124}, DevInf0125: {str: '', data: tablePorts.pPort_DevInf0125}, DevInf0126: {str: '', data: tablePorts.pPort_DevInf0126}, DevInf0127: {str: '', data: tablePorts.pPort_DevInf0127}, DevInf0128: {str: '', data: tablePorts.pPort_DevInf0128}, DevInf0129: {str: '', data: tablePorts.pPort_DevInf0129}, DevInf0130: {str: '', data: tablePorts.pPort_DevInf0130}}
    };
    
    return tableCodes;
}

//Export
module.exports.tableCodes = getTable;
module.exports.tablePorts = tablePortsInit;