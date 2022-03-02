import { getDatabase, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";

type QuestionType = {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
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

export function useRoom(roomId: string) {
    const [questions, setQuestions] = useState<Array<QuestionType>>([]);
    const [title, setTitle] = useState<string>('');

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

    return {questions, title};
}