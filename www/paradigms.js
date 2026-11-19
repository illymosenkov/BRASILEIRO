// Simple forms in the order eu, ele, nós, eles. Dictionary: conjugacao.com.br.
const paradigms = {
  "abrir": [
    "abro abre abrimos abrem",
    "abri abriu abrimos abriram",
    "abria abria abríamos abriam",
    "abrirei abrirá abriremos abrirão",
    "abriria abriria abriríamos abririam",
    "abra abra abramos abram"
  ],
  "acabar": [
    "acabo acaba acabamos acabam",
    "acabei acabou acabamos acabaram",
    "acabava acabava acabávamos acabavam",
    "acabarei acabará acabaremos acabarão",
    "acabaria acabaria acabaríamos acabariam",
    "acabe acabe acabemos acabem"
  ],
  "achar": [
    "acho acha achamos acham",
    "achei achou achamos acharam",
    "achava achava achávamos achavam",
    "acharei achará acharemos acharão",
    "acharia acharia acharíamos achariam",
    "ache ache achemos achem"
  ],
  "beber": [
    "bebo bebe bebemos bebem",
    "bebi bebeu bebemos beberam",
    "bebia bebia bebíamos bebiam",
    "beberei beberá beberemos beberão",
    "beberia beberia beberíamos beberiam",
    "beba beba bebamos bebam"
  ],
  "chamar": [
    "chamo chama chamamos chamam",
    "chamei chamou chamamos chamaram",
    "chamava chamava chamávamos chamavam",
    "chamarei chamará chamaremos chamarão",
    "chamaria chamaria chamaríamos chamariam",
    "chame chame chamemos chamem"
  ],
  "chegar": [
    "chego chega chegamos chegam",
    "cheguei chegou chegamos chegaram",
    "chegava chegava chegávamos chegavam",
    "chegarei chegará chegaremos chegarão",
    "chegaria chegaria chegaríamos chegariam",
    "chegue chegue cheguemos cheguem"
  ],
  "comer": [
    "como come comemos comem",
    "comi comeu comemos comeram",
    "comia comia comíamos comiam",
    "comerei comerá comeremos comerão",
    "comeria comeria comeríamos comeriam",
    "coma coma comamos comam"
  ],
  "começar": [
    "começo começa começamos começam",
    "comecei começou começamos começaram",
    "começava começava começávamos começavam",
    "começarei começará começaremos começarão",
    "começaria começaria começaríamos começariam",
    "comece comece comecemos comecem"
  ],
  "comprar": [
    "compro compra compramos compram",
    "comprei comprou compramos compraram",
    "comprava comprava comprávamos compravam",
    "comprarei comprará compraremos comprarão",
    "compraria compraria compraríamos comprariam",
    "compre compre compremos comprem"
  ],
  "conhecer": [
    "conheço conhece conhecemos conhecem",
    "conheci conheceu conhecemos conheceram",
    "conhecia conhecia conhecíamos conheciam",
    "conhecerei conhecerá conheceremos conhecerão",
    "conheceria conheceria conheceríamos conheceriam",
    "conheça conheça conheçamos conheçam"
  ],
  "dar": [
    "dou dá damos dão",
    "dei deu demos deram",
    "dava dava dávamos davam",
    "darei dará daremos darão",
    "daria daria daríamos dariam",
    "dê dê demos deem"
  ],
  "deixar": [
    "deixo deixa deixamos deixam",
    "deixei deixou deixamos deixaram",
    "deixava deixava deixávamos deixavam",
    "deixarei deixará deixaremos deixarão",
    "deixaria deixaria deixaríamos deixariam",
    "deixe deixe deixemos deixem"
  ],
  "dizer": [
    "digo diz dizemos dizem",
    "disse disse dissemos disseram",
    "dizia dizia dizíamos diziam",
    "direi dirá diremos dirão",
    "diria diria diríamos diriam",
    "diga diga digamos digam"
  ],
  "dormir": [
    "durmo dorme dormimos dormem",
    "dormi dormiu dormimos dormiram",
    "dormia dormia dormíamos dormiam",
    "dormirei dormirá dormiremos dormirão",
    "dormiria dormiria dormiríamos dormiriam",
    "durma durma durmamos durmam"
  ],
  "encontrar": [
    "encontro encontra encontramos encontram",
    "encontrei encontrou encontramos encontraram",
    "encontrava encontrava encontrávamos encontravam",
    "encontrarei encontrará encontraremos encontrarão",
    "encontraria encontraria encontraríamos encontrariam",
    "encontre encontre encontremos encontrem"
  ],
  "entender": [
    "entendo entende entendemos entendem",
    "entendi entendeu entendemos entenderam",
    "entendia entendia entendíamos entendiam",
    "entenderei entenderá entenderemos entenderão",
    "entenderia entenderia entenderíamos entenderiam",
    "entenda entenda entendamos entendam"
  ],
  "entrar": [
    "entro entra entramos entram",
    "entrei entrou entramos entraram",
    "entrava entrava entrávamos entravam",
    "entrarei entrará entraremos entrarão",
    "entraria entraria entraríamos entrariam",
    "entre entre entremos entrem"
  ],
  "escrever": [
    "escrevo escreve escrevemos escrevem",
    "escrevi escreveu escrevemos escreveram",
    "escrevia escrevia escrevíamos escreviam",
    "escreverei escreverá escreveremos escreverão",
    "escreveria escreveria escreveríamos escreveriam",
    "escreva escreva escrevamos escrevam"
  ],
  "esperar": [
    "espero espera esperamos esperam",
    "esperei esperou esperamos esperaram",
    "esperava esperava esperávamos esperavam",
    "esperarei esperará esperaremos esperarão",
    "esperaria esperaria esperaríamos esperariam",
    "espere espere esperemos esperem"
  ],
  "estar": [
    "estou está estamos estão",
    "estive esteve estivemos estiveram",
    "estava estava estávamos estavam",
    "estarei estará estaremos estarão",
    "estaria estaria estaríamos estariam",
    "esteja esteja estejamos estejam"
  ],
  "estudar": [
    "estudo estuda estudamos estudam",
    "estudei estudou estudamos estudaram",
    "estudava estudava estudávamos estudavam",
    "estudarei estudará estudaremos estudarão",
    "estudaria estudaria estudaríamos estudariam",
    "estude estude estudemos estudem"
  ],
  "falar": [
    "falo fala falamos falam",
    "falei falou falamos falaram",
    "falava falava falávamos falavam",
    "falarei falará falaremos falarão",
    "falaria falaria falaríamos falariam",
    "fale fale falemos falem"
  ],
  "fazer": [
    "faço faz fazemos fazem",
    "fiz fez fizemos fizeram",
    "fazia fazia fazíamos faziam",
    "farei fará faremos farão",
    "faria faria faríamos fariam",
    "faça faça façamos façam"
  ],
  "fechar": [
    "fecho fecha fechamos fecham",
    "fechei fechou fechamos fecharam",
    "fechava fechava fechávamos fechavam",
    "fecharei fechará fecharemos fecharão",
    "fecharia fecharia fecharíamos fechariam",
    "feche feche fechemos fechem"
  ],
  "ficar": [
    "fico fica ficamos ficam",
    "fiquei ficou ficamos ficaram",
    "ficava ficava ficávamos ficavam",
    "ficarei ficará ficaremos ficarão",
    "ficaria ficaria ficaríamos ficariam",
    "fique fique fiquemos fiquem"
  ],
  "gostar": [
    "gosto gosta gostamos gostam",
    "gostei gostou gostamos gostaram",
    "gostava gostava gostávamos gostavam",
    "gostarei gostará gostaremos gostarão",
    "gostaria gostaria gostaríamos gostariam",
    "goste goste gostemos gostem"
  ],
  "ir": [
    "vou vai vamos vão",
    "fui foi fomos foram",
    "ia ia íamos iam",
    "irei irá iremos irão",
    "iria iria iríamos iriam",
    "vá vá vamos vão"
  ],
  "ler": [
    "leio lê lemos leem",
    "li leu lemos leram",
    "lia lia líamos liam",
    "lerei lerá leremos lerão",
    "leria leria leríamos leriam",
    "leia leia leiamos leiam"
  ],
  "levar": [
    "levo leva levamos levam",
    "levei levou levamos levaram",
    "levava levava levávamos levavam",
    "levarei levará levaremos levarão",
    "levaria levaria levaríamos levariam",
    "leve leve levemos levem"
  ],
  "ouvir": [
    "ouço ouve ouvimos ouvem",
    "ouvi ouviu ouvimos ouviram",
    "ouvia ouvia ouvíamos ouviam",
    "ouvirei ouvirá ouviremos ouvirão",
    "ouviria ouviria ouviríamos ouviriam",
    "ouça ouça ouçamos ouçam"
  ],
  "passar": [
    "passo passa passamos passam",
    "passei passou passamos passaram",
    "passava passava passávamos passavam",
    "passarei passará passaremos passarão",
    "passaria passaria passaríamos passariam",
    "passe passe passemos passem"
  ],
  "pedir": [
    "peço pede pedimos pedem",
    "pedi pediu pedimos pediram",
    "pedia pedia pedíamos pediam",
    "pedirei pedirá pediremos pedirão",
    "pediria pediria pediríamos pediriam",
    "peça peça peçamos peçam"
  ],
  "pegar": [
    "pego pega pegamos pegam",
    "peguei pegou pegamos pegaram",
    "pegava pegava pegávamos pegavam",
    "pegarei pegará pegaremos pegarão",
    "pegaria pegaria pegaríamos pegariam",
    "pegue pegue peguemos peguem"
  ],
  "pensar": [
    "penso pensa pensamos pensam",
    "pensei pensou pensamos pensaram",
    "pensava pensava pensávamos pensavam",
    "pensarei pensará pensaremos pensarão",
    "pensaria pensaria pensaríamos pensariam",
    "pense pense pensemos pensem"
  ],
  "poder": [
    "posso pode podemos podem",
    "pude pôde pudemos puderam",
    "podia podia podíamos podiam",
    "poderei poderá poderemos poderão",
    "poderia poderia poderíamos poderiam",
    "possa possa possamos possam"
  ],
  "precisar": [
    "preciso precisa precisamos precisam",
    "precisei precisou precisamos precisaram",
    "precisava precisava precisávamos precisavam",
    "precisarei precisará precisaremos precisarão",
    "precisaria precisaria precisaríamos precisariam",
    "precise precise precisemos precisem"
  ],
  "pôr": [
    "ponho põe pomos põem",
    "pus pôs pusemos puseram",
    "punha punha púnhamos punham",
    "porei porá poremos porão",
    "poria poria poríamos poriam",
    "ponha ponha ponhamos ponham"
  ],
  "querer": [
    "quero quer queremos querem",
    "quis quis quisemos quiseram",
    "queria queria queríamos queriam",
    "quererei quererá quereremos quererão",
    "quereria quereria quereríamos quereriam",
    "queira queira queiramos queiram"
  ],
  "saber": [
    "sei sabe sabemos sabem",
    "soube soube soubemos souberam",
    "sabia sabia sabíamos sabiam",
    "saberei saberá saberemos saberão",
    "saberia saberia saberíamos saberiam",
    "saiba saiba saibamos saibam"
  ],
  "sair": [
    "saio sai saímos saem",
    "saí saiu saímos saíram",
    "saía saía saíamos saíam",
    "sairei sairá sairemos sairão",
    "sairia sairia sairíamos sairiam",
    "saia saia saiamos saiam"
  ],
  "sentir": [
    "sinto sente sentimos sentem",
    "senti sentiu sentimos sentiram",
    "sentia sentia sentíamos sentiam",
    "sentirei sentirá sentiremos sentirão",
    "sentiria sentiria sentiríamos sentiriam",
    "sinta sinta sintamos sintam"
  ],
  "ser": [
    "sou é somos são",
    "fui foi fomos foram",
    "era era éramos eram",
    "serei será seremos serão",
    "seria seria seríamos seriam",
    "seja seja sejamos sejam"
  ],
  "ter": [
    "tenho tem temos têm",
    "tive teve tivemos tiveram",
    "tinha tinha tínhamos tinham",
    "terei terá teremos terão",
    "teria teria teríamos teriam",
    "tenha tenha tenhamos tenham"
  ],
  "trabalhar": [
    "trabalho trabalha trabalhamos trabalham",
    "trabalhei trabalhou trabalhamos trabalharam",
    "trabalhava trabalhava trabalhávamos trabalhavam",
    "trabalharei trabalhará trabalharemos trabalharão",
    "trabalharia trabalharia trabalharíamos trabalhariam",
    "trabalhe trabalhe trabalhemos trabalhem"
  ],
  "trazer": [
    "trago traz trazemos trazem",
    "trouxe trouxe trouxemos trouxeram",
    "trazia trazia trazíamos traziam",
    "trarei trará traremos trarão",
    "traria traria traríamos trariam",
    "traga traga tragamos tragam"
  ],
  "vender": [
    "vendo vende vendemos vendem",
    "vendi vendeu vendemos venderam",
    "vendia vendia vendíamos vendiam",
    "venderei venderá venderemos venderão",
    "venderia venderia venderíamos venderiam",
    "venda venda vendamos vendam"
  ],
  "ver": [
    "vejo vê vemos veem",
    "vi viu vimos viram",
    "via via víamos viam",
    "verei verá veremos verão",
    "veria veria veríamos veriam",
    "veja veja vejamos vejam"
  ],
  "vir": [
    "venho vem vimos vêm",
    "vim veio viemos vieram",
    "vinha vinha vínhamos vinham",
    "virei virá viremos virão",
    "viria viria viríamos viriam",
    "venha venha venhamos venham"
  ],
  "viver": [
    "vivo vive vivemos vivem",
    "vivi viveu vivemos viveram",
    "vivia vivia vivíamos viviam",
    "viverei viverá viveremos viverão",
    "viveria viveria viveríamos viveriam",
    "viva viva vivamos vivam"
  ],
  "voltar": [
    "volto volta voltamos voltam",
    "voltei voltou voltamos voltaram",
    "voltava voltava voltávamos voltavam",
    "voltarei voltará voltaremos voltarão",
    "voltaria voltaria voltaríamos voltariam",
    "volte volte voltemos voltem"
  ]
};
