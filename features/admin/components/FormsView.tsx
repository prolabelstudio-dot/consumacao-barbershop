import { memo, type FormEvent } from "react";
import { REWARDS } from "../constants";
import { CheckIcon, GiftIcon } from "../icons";
import type { Product } from "../types";

type RegisterPointsFormProps = {
  loading: boolean;
  services: Product[];
  phone: string;
  serviceId: string;
  onPhoneChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export const RegisterPointsForm = memo(function RegisterPointsForm({
  loading,
  services,
  phone,
  serviceId,
  onPhoneChange,
  onServiceChange,
  onSubmit,
}: RegisterPointsFormProps) {
  return (
    <section className="card form-card">
      <h2 className="section-title">Registrar atendimento</h2>
      <p className="section-subtitle">Selecione o servico para pontuacao automatica.</p>
      <form onSubmit={onSubmit}>
        <div className="input-group">
          <label>WhatsApp do cliente</label>
          <input
            type="tel"
            className="input-field"
            placeholder="Ex: 11999999999"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            required
          />
          <small className="input-hint">Use DDD + numero sem espacos.</small>
        </div>
        <div className="input-group">
          <label>Servico realizado</label>
          <select
            className="input-field"
            value={serviceId}
            onChange={(event) => onServiceChange(event.target.value)}
            required
          >
            <option value="">Selecione um servico</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} (R$ {service.price})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : <CheckIcon />}
          <span>{loading ? "Processando..." : "Confirmar e pontuar"}</span>
        </button>
      </form>
    </section>
  );
});

type RegisterClientFormProps = {
  loading: boolean;
  name: string;
  phone: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export const RegisterClientForm = memo(function RegisterClientForm({
  loading,
  name,
  phone,
  onNameChange,
  onPhoneChange,
  onSubmit,
}: RegisterClientFormProps) {
  return (
    <section className="card form-card">
      <h2 className="section-title">Novo cadastro</h2>
      <p className="section-subtitle">Crie o cliente para iniciar o acumulo de pontos.</p>
      <form onSubmit={onSubmit}>
        <div className="input-group">
          <label>Nome completo</label>
          <input
            type="text"
            className="input-field"
            placeholder="Ex: Joao Silva"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>WhatsApp</label>
          <input
            type="tel"
            className="input-field"
            placeholder="Ex: 11955555555"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            required
          />
          <small className="input-hint">O telefone sera usado para buscas e contato.</small>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : <CheckIcon />}
          <span>{loading ? "Salvando..." : "Concluir cadastro"}</span>
        </button>
      </form>
    </section>
  );
});

type RedeemRewardFormProps = {
  loading: boolean;
  phone: string;
  rewardId: string;
  onPhoneChange: (value: string) => void;
  onRewardChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export const RedeemRewardForm = memo(function RedeemRewardForm({
  loading,
  phone,
  rewardId,
  onPhoneChange,
  onRewardChange,
  onSubmit,
}: RedeemRewardFormProps) {
  return (
    <section className="card form-card">
      <h2 className="section-title">Resgatar recompensa</h2>
      <p className="section-subtitle">Selecione o premio e confirme a baixa de pontos.</p>
      <form onSubmit={onSubmit}>
        <div className="input-group">
          <label>Telefone do cliente</label>
          <input
            type="tel"
            className="input-field"
            placeholder="Ex: 11999999999"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Recompensa</label>
          <select
            className="input-field"
            value={rewardId}
            onChange={(event) => onRewardChange(event.target.value)}
          >
            {REWARDS.map((reward) => (
              <option key={reward.id} value={reward.id}>
                {reward.name} ({reward.cost} pts)
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : <GiftIcon />}
          <span>{loading ? "Processando..." : "Efetuar resgate"}</span>
        </button>
      </form>
    </section>
  );
});
