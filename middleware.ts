export const config = {
    matcher: [
        // Run middleware on everything EXCEPT Next internals and common static files
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|woff|woff2|ttf|eot)$).*)",
    ],
};
