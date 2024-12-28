export type TPhoto = {
    caption : string
    documentId : string
    id : number
    url : string

}
export type TProduct = {
    id : number
    title : string
    description : string
    price : number
    category : 'food' | 'drink' | 'dry-food'
    photos : TPhoto[]
    soldOut : boolean | null
}