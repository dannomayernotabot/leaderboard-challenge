import { FormEventHandler } from "react"

type PropTypes = {
    fields: Array<string>,
    onSubmit: FormEventHandler<HTMLFormElement>
}

export default function Form({fields, onSubmit}: PropTypes) {
    return(
        <>
        <div className='form'>
            <form onSubmit={onSubmit}>
            {fields.map((field: string) => {
                return(
                    <div className='field'>
                    <label>
                      {field}:
                      <input type="text" name={field} />
                    </label>
                  </div>
                )
            })}
            <div>
                <input type="submit" value="Submit" />
            </div>
            </form>
        </div>
        <style jsx>{`
         .form {
            display: flex;
            justify-content: center;
            align-items: center;
         }   
         .field{
             margin-top: 5px
         }
         input{
             margin-top: 5px
         }
         label{
             font-weight: bold
         }
        `}</style>
        </>
    )
}