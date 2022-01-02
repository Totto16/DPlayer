<?php

header('Access-Control-Allow-Origin: *');

header('Access-Control-Allow-Methods: GET');

try {
    // Engage!
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

        //DPlayer.php
        $startTime = microtime(true);
        //TODO insert path here
        $path_to_vtts = "/INSERT_PATH_HERE/config/subs/";
        $server = "https://" . $_SERVER['HTTP_HOST'] . "/config/subs/";

        $global_version_number = 1;

        //QUERY Handeling
        parse_str($_SERVER["QUERY_STRING"], $query_array);
        $version = intval($query_array['version'] ?? '-1');
        $get_param = $query_array['get'] ?? 'default';
        $type_param = $query_array['type'] ?? 'default';
        $paramter_param = $query_array['parameter'] ?? 'default';
        $mode_param = $query_array['mode'] ?? 'exact';
        
        $response = array();
        $response["version"] = $global_version_number;

        if($version != $global_version_number){
            http_response_code(200);
            header('Content-Type: application/json; charset=UTF-8');
            $response["error"] = true;
            $response["error-message"] = "Version mismatch!";
            print(json_encode($response));
            exit();
        }

        switch($type_param){
            case "vtt":
                if($paramter_param == "default"){
                    http_response_code(200);
                    header('Content-Type: application/json; charset=UTF-8');
                    $response["error"] = true;
                    $response["error-message"] = "Parameter not recognized!";
                    print(json_encode($response));
                    exit();
                }

                $scanned_folder = scandir($path_to_vtts);

                if($scanned_folder == false){
                    http_response_code(200);
                    header('Content-Type: application/json; charset=UTF-8');
                    $response["error"] = true;
                    $response["error-message"] = "Couldn't scan vtt dir!";
                    print(json_encode($response));
                    exit();
                }

                $result_file = null;

                if($mode_param != "exact"){
                    //custom matching function, made for the chapter naming conventions of me/us
                    $regex_pattern =  "/" . preg_quote($paramter_param) . "/" ;
                    preg_match("/(\[?\w+\]?)([a-zA-ZüäößÜÖÄ]*)[\s\-_]*(\d+)[^\[]*(\[?[\w\d-]+\]?).*\.(.*)/", $paramter_param, $matches);
                    if($matches != null){
                        $regex_pattern = "/" . preg_quote($matches[1]) . ".*" .preg_quote($matches[2]) . ".*" . preg_quote($matches[3]) . ".*" . preg_quote(".vtt") . "/";
                    }
                }



                for ($i = 0; $i < count($scanned_folder); $i++) {
                    $current_file = $scanned_folder[$i];
                    if($mode_param == "exact"){
                        if($current_file == $paramter_param){
                            $result_file = $current_file;
                            break;
                        }
                    }else{
                        preg_match($regex_pattern, $current_file, $matches_regex);
                        if($matches_regex != null){
                            $result_file = $current_file;
                            break;
                        }
                    }
                    

                }

                if($result_file == null){
                    http_response_code(200);
                    header('Content-Type: application/json; charset=UTF-8');
                    $response["error"] = true;
                    $response["error-message"] = "Couldn't find anything!";
                    print(json_encode($response));
                    exit();
                }


                if($get_param == "reference"){
                    http_response_code(200);
                    header('Content-Type: application/json; charset=UTF-8');
                    $response["error"] = false;
                    $response["data"] = $server . urlencode($result_file);
                    $response["type"] = "reference";
                    print(json_encode($response));
                    exit();
                }else{
                    $raw_content = file_get_contents($path_to_vtts . $result_file);
                    if($raw_content == false){
                        http_response_code(200);
                        header('Content-Type: application/json; charset=UTF-8');
                        $response["error"] = true;
                        $response["error-message"] = "Error in reading File!";
                        print(json_encode($response));
                        exit();
                    }
                    http_response_code(200);
                    header('Content-Type: application/json; charset=UTF-8');
                    $response["error"] = false;
                    $response["data"] = $raw_content;
                    $response["type"] = "raw";
                    print(json_encode($response));
                    exit();
                }
                break;
            default:
                http_response_code(200);
                header('Content-Type: application/json; charset=UTF-8');
                $response["error"] = true;
                $response["error-message"] = "Type not recognized!";
                print(json_encode($response));
                exit();
                break;
        }

    }else{
        header("Allow: GET");
        http_response_code(405);
    }
} catch (Exception $e) {
    $mes=$e->getMessage();
    print "Exception : {$mes}\n";
}


