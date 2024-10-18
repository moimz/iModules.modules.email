<?php
/**
 * 이 파일은 이메일 모듈의 일부입니다. (https://www.coursemos.co.kr)
 *
 * 이메일 발송 내역 디테일을 가져온다.
 *
 * @file /modules/email/processes/message.get.php
 * @author ju318 <ju318@naddle.net>
 * @license MIT License
 * @modified 2024. 10. 18.
 *
 * @var \modules\email\Email $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('messages') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$message_id = Request::get('message_id', true);

$results->success = true;
$results->data = $me->getMessage($message_id)->getContent();
