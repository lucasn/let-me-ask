import copyImg from '../assets/images/copy.svg';

import '../styles/room-code.scss';

type RoomCodeProps = {
    roomCode: string;
}

export function RoomCode(props: RoomCodeProps) {

    function copyRoomCodeToClipboard() {
        navigator.clipboard.writeText(props.roomCode)
    }

    return (
        <button className="room-code" onClick={copyRoomCodeToClipboard}>
            <div>
                <img src={copyImg} alt="Copy room code" />
            </div>
            <span>Sala {props.roomCode}</span>
        </button>
    );
}