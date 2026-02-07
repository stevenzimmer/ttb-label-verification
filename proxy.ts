import {NextRequest} from "next/server";

export function proxy(request: NextRequest) {}

export const config = {
    matcher: [
        // Proxy everything EXCEPT Next internals + common static files
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|woff|woff2|ttf|eot)$).*)",
    ],
};
