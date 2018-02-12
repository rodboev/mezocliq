<?php
$host = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://") . $_SERVER['SERVER_NAME'];
$page = substr(dirname($_SERVER['SCRIPT_NAME']), 1);
$mainpage = (substr($page, 0, strrpos($page, '/')) ?: $page);
$subpage = substr($page, strrpos($page, '/') + 1);
$class = strrpos($page, '/') ? substr_replace($page, ' inner', strrpos($page, '/')) : substr($page, 0);
$current =  ' class="current selected"';
$selected = ' class="selected"';
header('X-Frame-Options: Deny');
header('Content-Type: text/html;charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <title><?php if (!empty($page)) echo ucwords(str_replace('-', ' ', (strpos($mainpage, $subpage) || empty($page)) ? $mainpage : $subpage)) . ' - '; ?>Mezocliq</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:description" content="Mezocliq provides a one-of-a-kind cloud-based enterprise technology solution at a fraction of the cost of other alternatives." />
    <meta property="og:image" content="<?php echo $host; ?>/img/share_preview.jpg" />
    <link rel="stylesheet" media="screen" href="/video/video-js.min.css">
    <link rel="stylesheet" media="all" href="/style.css">
    <link rel="icon" type="image/png" href="/img/favicon.png">
</head>
<body>

<div class="wrapper">

<main class="<?php echo empty($page) ? 'home' : $class; ?>">
<header>
    <a href="/">Mezocliq</a>
<?php if (empty($page)): ?>
    <a target="_blank" href="https://z.mezocliq.com/mezocliq/looqs.html" title="Login">Login</a>
<?php endif; ?>
</header>
<section>
