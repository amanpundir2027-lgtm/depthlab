'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {browserDb} from '@/lib/supabase';
import type {User} from '@supabase/supabase-js';
const db=browserDb();
const Context=createContext<{user:User|null;ready:boolean;db:NonNullable<ReturnType<typeof browserDb>>|null}>({user:null,ready:false,db});
export function Providers({children}:{children:React.ReactNode}){const[user,setUser]=useState<User|null>(null);const[ready,setReady]=useState(false);useEffect(()=>{if(!db){setReady(true);return}db.auth.getUser().then(({data})=>{setUser(data.user);setReady(true)});const{data:{subscription}}=db.auth.onAuthStateChange((_event,session)=>setUser(session?.user||null));return()=>subscription.unsubscribe()},[]);return <Context.Provider value={{user,ready,db}}>{children}</Context.Provider>}
export const useAccount=()=>useContext(Context);
export async function authHeader(db:NonNullable<ReturnType<typeof browserDb>>){const {data}=await db.auth.getSession();return {Authorization:`Bearer ${data.session?.access_token||''}`}}
