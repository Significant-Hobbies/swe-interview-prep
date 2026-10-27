export function homeMarkdown(copy, curriculum) {
  const b = copy.blocks;
  const paragraphs = (rows) => rows.join('\n\n');
  const title = b.Hero.slice(1, 5).join('');
  const code = b.PractisePanel;
  const panels = [
    paragraphs(b.LearnPanel) +
      '\n\n' +
      copy.learnRows.map(([term, detail]) => `- **${term}:** ${detail}`).join('\n'),
    `${paragraphs(code.slice(0, 2))}\n\n\`\`\`javascript\n${code[2]}${code[3]}{\n  ${code[4]}${code[5]}\n    ${code[6]}${code[7]}${code[8]}\n    ${code.slice(9, 12).join('\n    ')}\n}\n\`\`\`\n\n${code[12]}`,
    paragraphs(b.ExplainPanel),
    copy.reviewQueue.map((row) => `- ${row.name}: ${row.when}`).join('\n') +
      '\n\n' +
      paragraphs(b.ReviewPanel) +
      '\n\n' +
      copy.ratings.join(' · '),
  ];
  return `# ${title}\n\n${b.Hero[0]}\n\n${b.Hero[5]}\n\n[${b.Hero[6]}](${copy.links[0]}) · [${b.Hero[7].trim()}](${copy.links[1]})\n\n${b.Hero[8]}\n\n${paragraphs(b.LoopVisual.slice(1))}\n\n${copy.loop.map((row) => `- **${row.label}:** ${row.line}`).join('\n')}\n\n## ${b.Statement[0]}\n\n${paragraphs(b.Statement.slice(1))}\n\n## ${b.LoopIntro[1]}\n\n${b.LoopIntro[0]}\n\n${b.LoopIntro[2]}\n\n${copy.features.map((row, index) => `### ${row.eyebrow}: ${b['featureTitle' + index].join(' ')}\n\n${row.body.replace(/\{\{counts\.(\w+)\}\}/g, (_, key) => String(curriculum.counts[key]))}\n\n${panels[index]}\n\n${b.Panel[0]}`).join('\n\n')}\n\n## ${b.Coverage[0]}\n\n${curriculum.counts.tracks}${b.Coverage[1]}\n\n${b.Coverage[2]}\n\n${curriculum.tracks.map((row) => `- ${row.title}`).join('\n')}\n\n## ${b.Fit[0]}\n\n${b.Fit[1]}\n\n### ${b.Fit[2]}\n\n${b.Fit[3]}\n\n### ${b.Fit[4]}\n\n${b.Fit[5]}\n\n## ${b.Answers[0]}\n\n${copy.answers.map((row) => `### ${row.q}\n\n${row.a}`).join('\n\n')}\n\n## ${b.Close[0]}\n\n${b.Close[1]}\n\n[${b.Close[2]}](${copy.links[0]})\n`;
}
