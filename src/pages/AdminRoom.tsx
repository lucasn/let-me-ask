import { useHistory, useParams } from "react-router-dom";
import { getDatabase, push, ref, remove, update, get } from "firebase/database";

import { Button } from "../components/Button";
import { Question } from "../components/Question";
import { RoomCode } from "../components/RoomCode";

import { useAuth } from "../hooks/useAuth";
import { useRoom } from "../hooks/useRoom";

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';

import '../styles/room.scss';

type RoomParams = {
    id: string;
}

export function AdminRoom() {
    const { user } = useAuth();
    const history = useHistory();

    const params = useParams<RoomParams>();
    const roomId = params.id;
    
    const { title, questions } = useRoom(roomId);

    const database = getDatabase();

    async function handleEndRoom() {
        const roomRef = ref(database, `rooms/${roomId}`);
        await update(roomRef, {
            endedAt: new Date()
        });

        history.push('/');
    }

    async function handleDeleteQuestion(questionId: string) {
        const questionRef = ref(database, `rooms/${roomId}/questions/${questionId}`);
        await remove(questionRef);
    }

    async function handleCheckQuestionAsAnswered(questionId: string) {
        const questionRef = ref(database, `rooms/${roomId}/questions/${questionId}`);
        await update(questionRef, {isAnswered: true});
    }

    async function handleHighlightQuestion(questionId: string) {
        const questionRef = ref(database, `rooms/${roomId}/questions/${questionId}`);
        const questionHighlightState = (await get(questionRef)).val().isHighlighted;
        await update(questionRef, {isHighlighted: !questionHighlightState});
    }

    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                        <RoomCode roomCode={roomId}/>
                        <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
                    </div>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    <span>
                        {
                            (questions.length === 0) 
                                ? ("Nenhuma pergunta") 
                                : (questions.length === 1)
                                    ? ("1 pergunta")
                                    : (`${questions.length} perguntas`)
                        }
                    </span>
                </div>

                <div className="question-list">
                    {
                        questions.map(question => 
                            <Question 
                                key={question.id}
                                content={question.content} 
                                author={question.author} 
                                isAnswered={question.isAnswered}
                                isHighlighted={question.isHighlighted}
                            >
                                {(!question.isAnswered) && (
                                    <>
                                        <button type="button" onClick={() => handleCheckQuestionAsAnswered(question.id)}>
                                            <img src={checkImg} alt="Marcar pergunta como respondida" />
                                        </button>
                                        <button type="button" onClick={() => handleHighlightQuestion(question.id)}>
                                            <img src={answerImg} alt="Dar destaque à pergunta" />
                                        </button>
                                    </>
                                )}
                                <button type="button" onClick={() => handleDeleteQuestion(question.id)}>
                                    <img src={deleteImg} alt="Deletar Pergunta" />
                                </button>
                            </Question>
                            )
                    }
                </div>

            </main>
        </div>
    );
}