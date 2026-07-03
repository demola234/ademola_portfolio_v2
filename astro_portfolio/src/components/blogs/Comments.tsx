import Giscus from '@giscus/react';

export default function Comments() {
  return (
    <div style={{ marginTop: '48px' }}>
      <Giscus
        id="comments"
        repo="demola234/ademola_portfolio_v2"
        repoId="R_kgDOLsaNig"
        category="General"
        categoryId="DIC_kwDOLsaNis4Czm2R"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="dark"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
