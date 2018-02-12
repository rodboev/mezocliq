<nav>
    <p<?php if (empty($mainpage)) echo $selected;
        elseif ($mainpage === 'genesis') echo $current; ?>><a href="/genesis/">Our Obsession with<br />Enterprise Data Governance</a></p>
    <p<?php if ($mainpage === 'solution') echo $current ?>><a href="/solution/">Inspired Us to Build<br />a New Technology Solution</a></p>
    <p<?php if ($mainpage === 'coordinates') echo $current ?>><a href="/coordinates/">Empower your Innovators<br /> Join Us</a></p>
</nav>

</section>
<?php if (empty($page) || $mainpage === 'seen'): ?>
<footer>
    <a target="_blank" href="https://www.linkedin.com/company/mezocliq" title="LinkedIn">LinkedIn</a>
    <a target="_blank" href="https://www.youtube.com/channel/UCIymJ-m-X76A6hqy82H8CRg" title="YouTube">YouTube</a>
    <a href="/seen/" name="seen"<?php if ($mainpage === 'seen') echo $current ?>>Seen &amp; Heard</a>
</footer>
<?php endif; ?>
</main>

</div><!--.wrapper-->

<script src="/script.min.js"></script>
<script src="/video/video.min.js"></script>
<script async src='https://www.google-analytics.com/analytics.js'></script>
</body>
</html>
