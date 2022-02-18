import { createContext, ReactNode, useState, useEffect } from "react";
import { 
    User as FirebaseUser, 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider,
    getAuth
} from 'firebase/auth';

type User = {
    id: string;
    name: string;
    avatar: string;
}

type AuthContextType = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {

    const [user, setUser] = useState<User>();

    useEffect(() => {
  
      const unsubscribe =  onAuthStateChanged(getAuth(), user => {
  
        if (user){
          setUser(handleUserInformation(user));
        }
  
      });
  
      return () => {
        unsubscribe();
      }
    }, []);
  
    async function signInWithGoogle() {
      const provider = new GoogleAuthProvider();
  
      const result = await signInWithPopup(getAuth(), provider);
  
      if (result.user){
        
        setUser(handleUserInformation(result.user));
  
      }
         
    }

    return (
        <AuthContext.Provider value={{user, signInWithGoogle}}>
            {props.children}
        </AuthContext.Provider>
    );
}

function handleUserInformation(user: FirebaseUser): User {
    const { displayName, photoURL, uid } = user;
  
    if (!displayName || !photoURL){
      throw new Error('Missing information from Google Account');
    }
        
    return {id: uid, name: displayName, avatar: photoURL};
  }