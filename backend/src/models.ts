export type User = {
    id: number,
    email:string,
    password: string,
    todos: number
}

export type Todo = {
    id:number,
    title:string,
    description:string,
    user_id:number,
    completed:boolean,
    last_update:Date,
    created_at: Date
}