//costantes DA IA GROQ-------------------------------------------------------------
const GroqAPIkey = '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';
const GroqURL = 'https://api.groq.com/openai/v1/chat/completions';
const ModeloGroq = 'llama-3.3-70b-versatile'


//fução de de troca de elemento da barra de pesuquisa com exemplo-----------------
function Exemplo(el){
document.getElementById('PesquisaBarra').value = el.textContent;
document.getElementById('PesquisaBarra').focus();

}

// verificador de botão da barra de pesquisa -------------------------------------
document.getElementById('PesquisaBarra').addEventListener('keydown', e => {
    if (e.key === 'Enter')
    GeradorMapa();}
);

//gerador de mapa de aprendizagem--------------------------------------------------
async function GeradorMapa(){
    const Pesq = document.getElementById('PesquisaBarra').value.trim()

    //-----verificador de barra------\\
    if(!Pesq) {
        document.getElementById('PesquisaBarra').focus();
        return
    }
    //---------tela de loading-------\\
    document.getElementById('TelaInicial').style.display = 'none';
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('result').style.display = 'none';
    document.getElementById('erro-msg').style.display = 'none';
    const loadingMensagem = [
        '.',
        '...',
        '.....',
        '.......'
    ];
    let passos = 0

    const MsgIntevalo = setInterval(() => {
        passos = (passos + 1) % loadingMensagem.length;
        document.getElementById('loadingPassos').textContent = loadingMensagem[passos];
    },1000);

    //-------pronpt para a AI-------\\  
    const pronpt = `Você é um especialista em educação e aprendizagem. Crie um mapa de aprendizado completo e estruturado para alguém que quer aprender: "${Pesq}".

Responda APENAS com um JSON válido, sem markdown, sem blocos de código, no seguinte formato:
{
  "titulo": "título atraente do roadmap",
  "nivel": "Iniciante | Intermediário | Avançado",
  "duracao_total": "ex: 3-6 meses",
  "overview": "parágrafo explicando o que a pessoa vai aprender e por que é valioso",
  "etapas": [
    {
      "numero": 1,
      "titulo": "nome da etapa",
      "fase": "Fundamentos | Prática | Avançado | Projeto",
      "descricao": "o que aprender nessa etapa e como",
      "duracao": "ex: 2-3 semanas",
      "recursos": ["tipo de recurso 1", "tipo de recurso 2", "tipo de recurso 3"],
      "youtube_busca": "termo de busca específico para tutorial desse tópico no YouTube em português"
    }
  ],
  "dicas": ["dica motivacional ou prática 1", "dica 2", "dica 3", "dica 4"]
}

Crie entre 6 e 9 etapas progressivas e lógicas. Seja específico e prático. Recursos devem ser tipos (ex: "Livros introdutórios", "Cursos online gratuitos", "Exercícios práticos").`;
    

    //--------envioi de pronpt para groq-------\\
    try {
        const resposta = await fetch(GroqURL,{ 
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GroqAPIkey}`
            },
            body: JSON.stringify({
                model: ModeloGroq,
                messages:[{role: 'user', content: pronpt}],
                temperature: 0.7,
                max_tokens: 3000
            })
        });

    //--------verificador de erro ------\\
    if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.error?.message || `Erro ${resposta.status}`);
    }

        const data = await resposta.json();
        const TextoGerado = data.choices?.[0]?.message?.content || '';

        let JsonTexto = TextoGerado.trim();
        JsonTexto = JsonTexto.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();

        const RoadMap = JSON.parse(JsonTexto);
        clearInterval(MsgIntevalo);
        renderRoadmap(Pesq,RoadMap); 
    //--------mensagem de erro------\\
    } catch (erro) {
    clearInterval(MsgIntevalo);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('TelaInicial').style.display = 'block';
    const ErroTel = document.getElementById('erro-msg');
    ErroTel.style.display = 'block';
    ErroTel.textContent=`Não foi possível gerar o roadmap: ${erro.message}. Tente novamente.`;
    console.error(erro);
    }
}

//Escrita de road map---------------------------------------------------------------------------------------
function renderRoadmap(inputPesq,data) {
    document.getElementById('loading').style.display = 'none';

    const stepColors = ['#ff4d1c','#ff8c1c','#e8b800','#22a35a','#1c6eff','#7b2fff','#e91e8c'];

  const stepsHTML = (data.etapas || []).map((step, i) => {
    const color = stepColors[i % stepColors.length];
    const resourcesHTML = (step.recursos || []).map(r =>
      `<span class="resource-tag"> ${r}</span>`
    ).join('');

    const ytQuery = step.youtube_busca || step.titulo || '';
    const ytURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`;

    return `
      <div class="step-card" style="animation-delay: ${i * 0.08}s">
        <div class="step-number" style="border-color: ${color}; color: ${color}; box-shadow: 2px 2px 0 ${color}">
          ${step.numero || i + 1}
        </div>
        <div class="step-content">
          <div class="step-title">
            ${step.titulo || 'Etapa ' + (i+1)}
            ${step.fase ? `<span class="step-phase" style="background: ${color}22; color: ${color}">${step.fase}</span>` : ''}
          </div>
          <p class="step-desc">${step.descricao || ''}</p>
          ${step.duracao ? `<div class="step-duration"> ${step.duracao}</div>` : ''}
          ${resourcesHTML ? `<div class="step-resources">${resourcesHTML}</div>` : ''}
          <a class="yt-btn" href="${ytURL}" target="_blank" rel="noopener">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
            Ver vídeos sobre este tópico
          </a>
        </div>
      </div>
    `;
  }).join('');

  const tipsHTML = (data.dicas || []).map(tip =>
    `<div class="tip-item"><span class="tip-icon"></span><span>${tip}</span></div>`
  ).join('');

  const html = `
    <div class="result-header">
      <div>
        <div class="result-Pesq"> Mapa de Aprendizado</div>
        <div class="result-title">${data.titulo || inputPesq}</div>
        <div class="result-meta">
          ${data.nivel ? `<span class="meta-tag">${data.nivel}</span>` : ''}
          ${data.duracao_total ? `<span class="meta-tag outline"> ${data.duracao_total}</span>` : ''}
          <span class="meta-tag outline"> ${(data.etapas || []).length} etapas</span>
        </div>
      </div>
      <button class="reset-btn" onclick="resetForm()">← Novo tema</button>
    </div>

    ${data.overview ? `
    <div class="overview-card">
      <div class="overview-label">  Visão Geral</div>
      <p class="overview-text">${data.overview}</p>
    </div>
    ` : ''}

    <div class="roadmap-label"> Passos do Roadmap</div>
    <div class="roadmap">
      ${stepsHTML}
    </div>

    ${tipsHTML ? `
    <div class="tips-section">
      <div class="tips-label">  Dicas para o Sucesso</div>
      <div class="tips-list">${tipsHTML}</div>
    </div>
    ` : ''}
  `;
    const resultEl = document.getElementById('result');
  resultEl.innerHTML = html;
  resultEl.style.display = 'block';
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
  function resetForm() {
  document.getElementById('result').style.display = 'none';
  document.getElementById('erro-msg').style.display = 'none';
  document.getElementById('TelaInicial').style.display = 'block';
  document.getElementById('PesquisaBarra').value = '';
  document.getElementById('PesquisaBarra').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
