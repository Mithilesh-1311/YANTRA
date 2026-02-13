// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SmartMicrogrid {

    struct Building {
        uint256 storedEnergy; 
        bool registered;
    }

    struct EnergyTransaction {
        uint256 fromId;
        uint256 toId;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Building) public buildings;
    EnergyTransaction[] public transactions;

    event BuildingRegistered(uint256 id);
    event EnergyUpdated(uint256 id, uint256 energy);
    event EnergyTransferred(uint256 fromId, uint256 toId, uint256 amount);

    function registerBuilding(uint256 _id) public {
        require(!buildings[_id].registered, "Already registered");
        buildings[_id] = Building(0, true);
        emit BuildingRegistered(_id);
    }

    function updateEnergy(uint256 _id, uint256 _amount) public {
        require(buildings[_id].registered, "Building not registered");
        buildings[_id].storedEnergy = _amount;
        emit EnergyUpdated(_id, _amount);
    }

    function transferEnergy(
        uint256 _fromId,
        uint256 _toId,
        uint256 _amount
    ) public {

        require(buildings[_fromId].registered, "Sender not registered");
        require(buildings[_toId].registered, "Receiver not registered");
        require(buildings[_fromId].storedEnergy >= _amount, "Insufficient energy");

        buildings[_fromId].storedEnergy -= _amount;
        buildings[_toId].storedEnergy += _amount;

        transactions.push(
            EnergyTransaction(
                _fromId,
                _toId,
                _amount,
                block.timestamp
            )
        );

        emit EnergyTransferred(_fromId, _toId, _amount);
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
}