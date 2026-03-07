import { CheckIcon } from "../icons";

type LoadingViewProps = {
  text: string;
};

export function LoadingView({ text }: LoadingViewProps) {
  return (
    <main className="auth-shell">
      <div className="loading-view">
        <div className="spinner large" />
        <p>{text}</p>
      </div>
    </main>
  );
}

type LandingViewProps = {
  onAccessPanel: () => void;
};

export function LandingView({ onAccessPanel }: LandingViewProps) {
  return (
    <main className="auth-shell">
      <div className="landing-wrap">
        <span className="pill">Gestao de fidelidade para barbearias</span>
        <h1>Operacao mais rapida, clientes mais fieis.</h1>
        <p>
          Um painel unico para cadastrar clientes, registrar atendimentos e
          acompanhar pontos sem friccao.
        </p>
        <div className="landing-actions">
          <button className="btn btn-primary" onClick={onAccessPanel}>
            Acessar painel
          </button>
        </div>
      </div>
    </main>
  );
}

type LoginViewProps = {
  loading: boolean;
  onLogin: () => void;
  onBack: () => void;
};

export function LoginView({ loading, onLogin, onBack }: LoginViewProps) {
  return (
    <main className="auth-shell">
      <section className="card login-card">
        <h1 className="section-title">Login administrativo</h1>
        <p className="section-subtitle">Acesso interno para equipe da barbearia.</p>
        <div className="input-group">
          <label>Identificador</label>
          <input type="text" className="input-field" value="admin" readOnly />
        </div>
        <button onClick={onLogin} className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : <CheckIcon />}
          <span>{loading ? "Entrando..." : "Entrar"}</span>
        </button>
        <button className="btn btn-subtle" onClick={onBack}>
          Voltar
        </button>
      </section>
    </main>
  );
}
