pragma solidity ^0.4.24;

library IPFSLib {
    bytes constant ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    bytes constant HEX = "0123456789abcdef";

    /**
     * @dev Base58 encoding
     * @param _source Bytes data
     * @return Encoded bytes data
     */
    function base58Address(bytes _source) internal pure returns (bytes) {
        uint8[] memory digits = new uint8[](_source.length * 136/100 + 1);
        digits[0] = 0;
        uint8 digitlength = 1;
        for (uint i = 0; i < _source.length; ++i) {
            uint carry = uint8(_source[i]);
            for (uint j = 0; j<digitlength; ++j) {
                carry += uint(digits[j]) * 256;
                digits[j] = uint8(carry % 58);
                carry = carry / 58;
            }
            
            while (carry > 0) {
                digits[digitlength] = uint8(carry % 58);
                digitlength++;
                carry = carry / 58;
            }
        }
        return toAlphabet(reverse(truncate(digits, digitlength)));
    }

    /**
     * @dev Hex encoding, convert bytes32 data to hex string
     * @param _source Bytes32 data
     * @return hex string bytes
     */
    function hexAddress(bytes32 _source) internal pure returns(bytes) {
        uint256 value = uint256(_source);
        bytes memory result = "0000000000000000000000000000000000000000000000000000000000000000";
        uint8 index = 0;
        while(value > 0) {
            result[index] = HEX[value & 0xf];
            index++;
            value = value>>4;
        }
        bytes memory ipfsBytes = reverseBytes(result);
        return ipfsBytes;
    }

    /**
     * @dev Truncate `_array` by `_length`
     * @param _array The source array
     * @param _length The target length of the `_array`
     * @return The truncated array 
     */
    function truncate(uint8[] _array, uint8 _length) internal pure returns (uint8[]) {
        uint8[] memory output = new uint8[](_length);
        for (uint i = 0; i < _length; i++) {
            output[i] = _array[i];
        }
        return output;
    }
    
    /**
     * @dev Reverse `_input` array 
     * @param _input The source array 
     * @return The reversed array 
     */
    function reverse(uint8[] _input) internal pure returns (uint8[]) {
        uint8[] memory output = new uint8[](_input.length);
        for (uint i = 0; i < _input.length; i++) {
            output[i] = _input[_input.length - 1 - i];
        }
        return output;
    }

    /**
     * @dev Reverse `_input` bytes
     * @param _input The source bytes
     * @return The reversed bytes
     */
    function reverseBytes(bytes _input) private pure returns (bytes) {
        bytes memory output = new bytes(_input.length);
        for (uint8 i = 0; i < _input.length; i++) {
            output[i] = _input[_input.length-1-i];
        }
        return output;
    }
    
    /**
     * @dev Convert the indices to alphabet
     * @param _indices The indices of alphabet
     * @return The alphabets
     */
    function toAlphabet(uint8[] _indices) internal pure returns (bytes) {
        bytes memory output = new bytes(_indices.length);
        for (uint i = 0; i < _indices.length; i++) {
            output[i] = ALPHABET[_indices[i]];
        }
        return output;
    }

    /**
     * @dev Convert bytes32 to bytes
     * @param _input The source bytes32
     * @return The bytes
     */
    function toBytes(bytes32 _input) internal pure returns (bytes) {
        bytes memory output = new bytes(32);
        for (uint8 i = 0; i < 32; i++) {
            output[i] = _input[i];
        }
        return output;
    }

    /**
     * @dev Concat two bytes to one
     * @param _byteArray The first bytes
     * @param _byteArray2 The second bytes
     * @return The concated bytes
     */
    function concat(bytes _byteArray, bytes _byteArray2) internal pure returns (bytes) {
        bytes memory returnArray = new bytes(_byteArray.length + _byteArray2.length);
        for (uint16 i = 0; i < _byteArray.length; i++) {
            returnArray[i] = _byteArray[i];
        }
        for (i; i < (_byteArray.length + _byteArray2.length); i++) {
            returnArray[i] = _byteArray2[i - _byteArray.length];
        }
        return returnArray;
    }
}