package gotrainer.humanai.kata;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class Kata {

    public Process process;
    public BufferedReader reader;
    public BufferedWriter writer;
    public Thread inputThread;

    public Kata() throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder("katago\\katago.exe", "gtp");
        processBuilder.redirectErrorStream(true);
        process = processBuilder.start();

        reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));

        String line;
        do {
            line = reader.readLine();
            System.out.println(line);
        } while (!line.contains("GTP ready"));
        write("version");

//        inputThread = new Thread(() -> {
//            try {
//                String line;
//                while ((line = reader.readLine()) != null) {
//                    System.out.println(line);
//                }
//            } catch (Exception e) {}
//        });
//        inputThread.start();
    }

    public void commands() throws Exception {
        clearReader();
        write("list_commands");
    }

    public String genmove(String color) throws Exception {
        clearReader();
        write("genmove " + color);
        String move = reader.readLine().split(" ")[1];
        System.out.println("genmove " + color + " " + move);
        return move;
    }

    public List<String> analyze(String color) throws Exception {
        clearReader();
        write("lz-analyze " + color + " interval 100 minmoves 3 maxmoves 3");
        reader.readLine(); // Ignore '= '
        String[] analysis = reader.readLine().split(" ");
        write("\n");
        List<String> moves = new ArrayList<>();
        for (int i=0; i<analysis.length; i++) {
            if (analysis[i].equals("move")) {
                moves.add(analysis[i+1]);
            }
        }
        return moves;
    }

    public void play(String color, String coord) throws Exception {
        clearReader();
        write("play " + color + " " + coord);
        System.out.println("play " + color + " " + coord);
    }

    private void write(String command) throws Exception {
        writer.write(command + "\n");
        writer.flush();
    }

    private void clearReader() throws Exception {
        while (!reader.readLine().equals("")) {}
//        reader.skip(Long.MAX_VALUE);
    }

}
