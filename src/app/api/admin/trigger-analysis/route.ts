
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST() {
    try {
        console.log("Triggering AI Analysis manually...");

        // Path to the script
        const scriptPath = path.join(process.cwd(), 'scripts', 'ai-analyst.ts');
        const tsNodePath = path.join(process.cwd(), 'node_modules', 'ts-node', 'dist', 'bin.js');
        const tsConfigPath = path.join(process.cwd(), 'tsconfig.script.json');

        // Command to run the script in background (detached)
        // We don't await the result because it can take a long time
        const command = `node "${tsNodePath}" --project "${tsConfigPath}" "${scriptPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Analysis script error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Analysis script stderr: ${stderr}`);
                return;
            }
            console.log(`Analysis script stdout: ${stdout}`);
        });

        return NextResponse.json({
            success: true,
            message: 'Analiz işlemi arka planda başlatıldı. Sonuçlar birkaç dakika içinde panele düşecektir.'
        });

    } catch (error) {
        console.error('Failed to trigger analysis:', error);
        return NextResponse.json({ error: 'Failed to start analysis' }, { status: 500 });
    }
}
