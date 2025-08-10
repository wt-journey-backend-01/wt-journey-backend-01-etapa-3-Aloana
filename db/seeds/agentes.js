exports.seed = async function(knex) {
  await knex('agentes').del();
  await knex('agentes').insert([
    { nome: "Rommel Carneiro", dataDeIncorporacao: "1992-10-04", cargo: "delegado" },
    { nome: "Aloana Silva", dataDeIncorporacao: "2024-05-15", cargo: "investigadora" },
    { nome: "Carlos Souza", dataDeIncorporacao: "2010-03-20", cargo: "agente" },
    { nome: "Fernanda Lima", dataDeIncorporacao: "2012-07-30", cargo: "perita" },
    { nome: "João Pereira", dataDeIncorporacao: "2018-11-10", cargo: "escrivão" },
    { nome: "Mariana Costa", dataDeIncorporacao: "2020-01-05", cargo: "agente" },
    { nome: "Roberto Alves", dataDeIncorporacao: "2021-06-15", cargo: "investigador" },
    { nome: "Patrícia Rocha", dataDeIncorporacao: "2019-09-25", cargo: "agente" },
    { nome: "Lucas Martins", dataDeIncorporacao: "2022-02-18", cargo: "delegado" }
  ]);
};
