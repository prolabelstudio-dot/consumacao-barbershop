import { memo } from "react";
import type { Product } from "../types";

type ServicesViewProps = {
  services: Product[];
};

export const ServicesView = memo(function ServicesView({ services }: ServicesViewProps) {
  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2 className="section-title">Tabela de servicos e pontuacao</h2>
          <p className="section-subtitle">Valores e pontos usados para calculo automatico.</p>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-head services-grid">
          <span>Servico</span>
          <span>Preco</span>
          <span>Pontos</span>
        </div>
        {services.map((service) => (
          <div key={service.id} className="table-row services-grid">
            <span className="row-main">{service.name}</span>
            <span className="row-muted">R$ {service.price}</span>
            <span className="row-points">+{service.pointsAward} pts</span>
          </div>
        ))}
      </div>
    </section>
  );
});
