export default function Auth(props) {
    return (
        <div className="auth">
            <button onClick={props.signIn}>Sign In</button>
            <button onClick={props.signUp}>Sign Up</button>
        </div>
    );
}