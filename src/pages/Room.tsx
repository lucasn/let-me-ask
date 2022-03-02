import { useParams } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg';
import likeImg from '../assets/images/like.svg';

import { Button } from '../components/Button';

import '../styles/room.scss';

import { RoomCode } from '../components/RoomCode';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

import { getDatabase, ref, push, onValue } from 'firebase/database';
import { Question } from '../components/Question';

type RoomParams = {
    id: string;
}

type FirebaseQuestions = Record<string, {
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
}>

type Question = {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
}

export function Room() {

    const { user } = useAuth();

    const params = useParams<RoomParams>();

    const [newQuestion, setNewQuestion] = useState<string>('');
    const [questions, setQuestions] = useState<Array<Question>>([]);
    const [title, setTitle] = useState<string>('');

    const roomId = params.id;

    const database = getDatabase();

    useEffect(() => {
        const roomRef = ref(database, `rooms/${roomId}`);

        onValue(roomRef, room => {
            const databaseRoom = room.val();
            const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key,
                    content: value.content,
                    author: value.author,
                    isHighlighted: value.isHighlighted,
                    isAnswered: value.isAnswered
                }
            });

            setTitle(databaseRoom.title);
            setQuestions(parsedQuestions);
        });
        
    }, [roomId]);

    async function handleSendQuestion(event: FormEvent) {

        event.preventDefault();

        if (newQuestion.trim() === '') return;

        if (!user) {
            throw new Error('You must be logged in');
        }

        const question = {
            content: newQuestion,
            author: {
                name: user.name,
                avatar: user.avatar
            },
            isHighlighted: false,
            isAnswered: false
        };

        const questionRef = ref(database, `rooms/${roomId}/questions`);

        await push(questionRef, question);

        setNewQuestion('');
    }

    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <RoomCode roomCode={roomId}/>
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

                <form onSubmit={handleSendQuestion}>
                    <textarea 
                        placeholder="O que você quer perguntar?"
                        onChange={event => setNewQuestion(event.target.value)}
                        value={newQuestion}
                    />
                    <div className="form-footer">
                        {user ? (
                            <div className='user-info'>
                                <img referrerPolicy="no-referrer" src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ) : (
                            <span>Para enviar uma pergunta, <button>faça seu login.</button></span>
                        )}
                        <Button type="submit" disabled={!user}>Enviar pergunta</Button>
                    </div>
                </form>

                <div className="question-list">
                    {
                        questions.map(question => 
                            <Question 
                                key={question.id}
                                content={question.content} 
                                author={question.author} 
                            />)
                    }
                </div>

            </main>
        </div>
    );
}