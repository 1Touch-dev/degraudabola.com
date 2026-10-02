# Degrau da Bola — article endpoints

Website: [degraudabola.com](https://degraudabola.com)  
CMS key: `degraudabola`  
Focus: Campeonato Brasileiro Série B, acesso à Série A, and related Brazilian football.

Use these endpoints to classify or generate articles.

```javascript
const degrauDaBolaEndpoints = [
  {
    name: "HomePage",
    promptGuide: "Generate or classify homepage football content for Degrau da Bola. Prioritize Brazilian Série B, the promotion race to Série A, live scores, featured matches, access and relegation headlines, latest club news, standings highlights, upcoming fixtures, results, transfers, Copa do Brasil, and Brazil national team updates when they affect the site's audience."
  },
  {
    name: "Série B",
    promptGuide: "Target news and data about Campeonato Brasileiro Série B. Include current Série B clubs, match previews, results, round-by-round coverage, goals, standings, injuries, suspensions, coaches, tactics, stadiums, referees, and club updates. This is the core section of Degrau da Bola."
  },
  {
    name: "Acesso",
    promptGuide: "Classify promotion-race content. Include the fight for the four Série A promotion spots, G4, playoff pressure if relevant, points gaps, goal difference, remaining fixtures, direct clashes, form, mathematical chances, and what each result means for access. Tagline context: each point is a step toward promotion."
  },
  {
    name: "Rebaixamento",
    promptGuide: "Target the Série B relegation battle. Include the bottom of the table, teams threatened with dropping to Série C, points needed to escape, decisive matches, goal difference, and survival scenarios."
  },
  {
    name: "Brasileirão",
    promptGuide: "Classify Série A content only when it connects to Degrau da Bola readers. Include clubs that came down from Série A, clubs fighting to return, promotion destinations, Brasileirão table context, and stories about recently promoted or relegated Brazilian clubs."
  },
  {
    name: "Copa do Brasil",
    promptGuide: "Target Copa do Brasil coverage involving Série B clubs and other Brazilian sides relevant to this audience. Include draws, fixtures, results, upsets, knockout rounds, lineups, and how cup runs affect league form and the promotion race."
  },
  {
    name: "Libertadores",
    promptGuide: "Classify Copa Libertadores content relevant to Brazilian football fans of Degrau da Bola. Include Brazilian clubs in the tournament, group stage, knockouts, fixtures, results, opponents, CONMEBOL updates, and match analysis. Use this only when the story is clearly Libertadores, not domestic league."
  },
  {
    name: "Seleção",
    promptGuide: "Classify content about the Brazil national team. Include Seleção, call-ups, World Cup qualifiers, Copa América, friendlies, player performances, coaching decisions, lineups, injuries, and Brazilian players called up from Série B or abroad."
  },
  {
    name: "Clubes",
    promptGuide: "Target club-specific news. Include squads, coaches, stadiums, form, fixtures, results, table position, official announcements, injuries, tactical changes, and stories focused on one Série B club or a club in the promotion or relegation fight."
  },
  {
    name: "Regional",
    promptGuide: "Classify regional and state-level Brazilian football that feeds Série B. Include state championships, interior clubs, regional derbies, fan bases, stadiums, and news tied to a Brazilian state when it matters to a Série B club."
  },
  {
    name: "Calendário",
    promptGuide: "Target match schedule content. Include upcoming fixtures, matchdays, kickoff times, venues, postponed games, rescheduled matches, Série B calendar, Copa do Brasil dates, and Brazil national team matches."
  },
  {
    name: "Resultados",
    promptGuide: "Classify completed-match and results content. Include final scores, round summaries, who won and lost, how the result moves the promotion race or relegation zone, goal scorers, and post-match consequences for the table."
  },
  {
    name: "Tabela",
    promptGuide: "Classify standings and ranking content. Include the Série B table, points, goal difference, wins, draws, losses, form, promotion zone, relegation zone, and ranking updates after each round."
  },
  {
    name: "Transferências",
    promptGuide: "Target the transfer market for Série B and related Brazilian clubs. Include confirmed signings, rumors, loans, free agents, contract renewals, departures, fees, negotiations, club interest, and players moving between Série A, Série B, and abroad."
  },
  {
    name: "Partidas",
    promptGuide: "Classify match-center content. Include live scores, minute-by-minute updates, goals, cards, substitutions, lineups, formations, match stats, possession, shots, corners, referees, venues, and post-match summaries."
  },
  {
    name: "Jogadores",
    promptGuide: "Classify player-focused content. Include profiles, goals, assists, appearances, injuries, suspensions, performance, transfer status, national-team call-ups, and statistics for players in Série B or Brazilians relevant to these clubs."
  },
  {
    name: "Notícias",
    promptGuide: "Target general football news that fits Degrau da Bola but is not limited to one competition page. Include breaking stories, federation decisions, disciplinary cases, coach statements, fan incidents, and broader Brazilian football coverage tied to Série B."
  },
  {
    name: "Other",
    promptGuide: "If the content does not clearly match any Degrau da Bola football section above, classify it here."
  }
];
```
