pragma solidity ^0.4.17;

contract Lottery{
    address public manager;
    address[] public player;

    function Lottery() public{
        manager = msg.sender;
    }

    function enter() public payable{
        require(msg.value > .01 ether);
        player.push(msg.sender);
    }

    function random() private view returns (uint){
       return uint(keccak256(block.difficulty, now, player));
    }

    function pickWinner() public only_manager{
        require(msg.sender == manager);
        uint index = random() % player.length;
        player[index].transfer(this.balance);
        player = new address[](0);
    }

    modifier only_manager(){
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address[]){
        return player;
    }

}
