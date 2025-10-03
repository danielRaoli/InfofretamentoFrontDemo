"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { api } from "@/lib/axios";
import { Veiculo, Viagem } from "@/lib/types";

interface Event {
  id: string;
  title: string;
  start: string;
}

const CalendarApp = () => {
  const [events, setEvents] = useState<Event[]>([]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleDatesSet = async (arg: {
    start: Date;
    end: Date;
    startStr: string;
    endStr: string;
    view: any;
  }) => {
    try {
      // 1. Recuperar as viagens da API
      const responseViagens = await api.get("/viagem");
      const viagens: Viagem[] = Array.isArray(responseViagens.data.data)
        ? responseViagens.data.data
        : responseViagens.data?.data.viagens || [];

      console.log("Viagens:", viagens);

      // Verificação se viagens é um array
      if (!Array.isArray(viagens)) {
        console.error(
          "O formato da resposta não é uma lista de viagens:",
          viagens
        );
        return;
      }

      // 2. Filtrar as viagens do mês selecionado
      const startDate = arg.start;
      const endDate = arg.end;

      const viagensDoMesSelecionado = viagens.filter((viagem) => {
        const dataPartida = new Date(viagem.dataHorarioSaida.data);
        return dataPartida >= startDate && dataPartida <= endDate;
      });

      // 3. Obter os IDs únicos dos veículos das viagens do mês selecionado
      const veiculoIds = [
        ...new Set(viagensDoMesSelecionado.map((viagem) => viagem.veiculoId)),
      ];

      // 4. Recuperar os dados dos veículos da API
      const responseVeiculos = await api.get("/veiculo", {
        params: { ids: veiculoIds.join(",") }, // Envia os IDs dos veículos na requisição
      });

      const veiculos = Array.isArray(responseVeiculos.data.data)
        ? responseVeiculos.data.data
        : responseVeiculos.data?.data.veiculos || [];

      // Cria um dicionário de veículos para facilitar a busca por ID
      const veiculosMap = veiculos.reduce(
        (acc: Record<string, Veiculo>, veiculo: Veiculo) => {
          acc[veiculo.id] = veiculo;
          return acc;
        },
        {}
      );

      // 5. Mapear as viagens para criar eventos no calendário
      const eventos: Event[] = [];

      viagensDoMesSelecionado.forEach((viagem) => {
        const veiculo = veiculosMap[viagem.veiculoId];
        const placa = veiculo ? veiculo.prefixo : "Desconhecido";

        // Calcular o intervalo de datas
        const startDate = new Date(viagem.dataHorarioSaida.data);
        const endDate = new Date(viagem.dataHorarioChegada.data);

        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          eventos.push({
            id: `${viagem.id}-${date.toISOString()}`,
            title: `${placa}`,
            start: date.toISOString().split("T")[0], // Apenas a data
          });
        }
      });

      // 6. Atualizar os eventos no estado
      setEvents(eventos);
    } catch (error) {
      console.error("Erro ao buscar as viagens ou veículos:", error);
    }
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="App text-white bg-[#070180] pt-10">
      <h1 className="text-center font-bold mb-4 md:text-2xl text-xl">
        Calendário de Veículos
      </h1>
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          locale="pt-br"
          height="auto"
          contentHeight="auto"
          buttonText={{
            today: "Mês Atual",
          }}
          datesSet={handleDatesSet} // Adiciona o evento para carregar as viagens ao mudar de mês
        />
      </div>
    </div>
  );
};

export default CalendarApp;
